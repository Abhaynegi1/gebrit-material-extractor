// routes/api.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Import services
const CADProcessor = require('../services/CADProcessor');
const MaterialCalculator = require('../services/MaterialCalculator');
const ExcelGenerator = require('../services/ExcelGenerator');
const SelectionSetUtil = require('../services/SelectionSetUtil');

// Import models
const PipeSheet = require('../models/PipeSheet');
const ValidationUtils = require('../utils/ValidationUtils');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        fs.ensureDirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only CAD files
        const allowedTypes = ['.dxf', '.dwg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only DXF and DWG files are allowed'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// In-memory storage for processed materials (in production, use a database)
let processedMaterials = [];
let processedEntities = [];

// POST /api/process-cad - Upload and process CAD files
router.post('/process-cad', upload.single('cadFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CAD file uploaded' });
        }

        const cadProcessor = new CADProcessor();
        const filePath = req.file.path;

        // Process the CAD file
        const entities = await cadProcessor.processCADFile(filePath);

        // Store processed entities
        processedEntities = entities;

        // Clean up uploaded file
        await fs.remove(filePath);

        res.json({
            success: true,
            message: 'CAD file processed successfully',
            data: {
                polylines: entities.polylines.length,
                circles: entities.circles.length,
                blocks: entities.blocks.length,
                totalEntities: entities.totalEntities,
                layers: extractUniqueLayers(entities)
            }
        });

    } catch (error) {
        console.error('Error processing CAD file:', error);
        
        // Clean up file on error
        if (req.file) {
            await fs.remove(req.file.path);
        }
        
        res.status(500).json({ 
            error: 'Failed to process CAD file', 
            details: error.message 
        });
    }
});

// Helper method to extract unique layers
function extractUniqueLayers(entities) {
    const layers = new Set();
    
    entities.polylines.forEach(p => layers.add(p.layer));
    entities.circles.forEach(c => layers.add(c.layer));
    entities.blocks.forEach(b => layers.add(b.layer));
    
    return Array.from(layers);
}

// POST /api/calculate-materials - Calculate materials from processed data
router.post('/calculate-materials', async (req, res) => {
    try {
        if (processedEntities.length === 0) {
            return res.status(400).json({ error: 'No processed CAD data available. Please upload a CAD file first.' });
        }

        const { pipeSheetConfig, shafts } = req.body;

        // Validate input
        const validation = ValidationUtils.validateExtractionInput({
            pipeSheet: pipeSheetConfig,
            entities: processedEntities,
            shafts: shafts
        });

        if (!validation.isValid) {
            return res.status(400).json({ error: 'Validation failed', details: validation.errors });
        }

        // Create PipeSheet instance
        const pipeSheet = PipeSheet.fromObject(pipeSheetConfig);

        // Initialize services
        const materialCalculator = new MaterialCalculator(pipeSheet);
        const selectionSetUtil = new SelectionSetUtil();

        // Process materials
        const materials = materialCalculator.processPipes(processedEntities.polylines);
        
        // Group by shaft and calculate quantities
        const shaftMaterials = selectionSetUtil.groupByShaft(materials);
        const quantitiesByShaft = selectionSetUtil.calculateQuantitiesByShaft(materials);

        // Store processed materials
        processedMaterials = materials;

        res.json({
            success: true,
            message: 'Materials calculated successfully',
            data: {
                materials: materials,
                shaftMaterials: shaftMaterials,
                quantitiesByShaft: quantitiesByShaft,
                totalMaterials: materials.length
            }
        });

    } catch (error) {
        console.error('Error calculating materials:', error);
        res.status(500).json({ error: 'Failed to calculate materials', details: error.message });
    }
});

// POST /api/export-excel - Generate Excel reports
router.post('/export-excel', async (req, res) => {
    try {
        const { shafts, outputPath } = req.body;

        if (!processedMaterials || processedMaterials.length === 0) {
            return res.status(400).json({ 
                error: 'No materials available for export. Please calculate materials first.' 
            });
        }

        if (!shafts || shafts.length === 0) {
            return res.status(400).json({ 
                error: 'Shaft information is required for Excel export.' 
            });
        }

        const excelGenerator = new ExcelGenerator();
        
        if (outputPath) {
            // Save to file
            await excelGenerator.generateExcel(processedMaterials, shafts, outputPath);
            res.json({
                success: true,
                message: 'Excel file generated successfully',
                filePath: outputPath
            });
        } else {
            // Return as buffer for download
            const excelBuffer = await excelGenerator.generateExcel(processedMaterials, shafts);

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=geb-materials.xlsx');
            res.setHeader('Content-Length', excelBuffer.length);

            res.send(excelBuffer);
        }

    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({ 
            error: 'Failed to generate Excel file', 
            details: error.message 
        });
    }
});

// POST /api/export-multi-excel - Generate multi-sheet Excel reports
router.post('/export-multi-excel', async (req, res) => {
    try {
        const { shafts, outputPath, includeCalculations = true } = req.body;

        if (!processedMaterials || processedMaterials.length === 0) {
            return res.status(400).json({ 
                error: 'No materials available for export. Please calculate materials first.' 
            });
        }

        if (!shafts || shafts.length === 0) {
            return res.status(400).json({ 
                error: 'Shaft information is required for Excel export.' 
            });
        }

        const excelGenerator = new ExcelGenerator();
        
        // Prepare data for multi-sheet Excel
        const data = {
            summary: {
                totalMaterials: processedMaterials.length,
                totalQuantity: processedMaterials.reduce((sum, m) => sum + (m.quantity || 0), 0),
                totalPipes: processedMaterials.filter(m => m.type === 'pipe').length,
                totalFittings: processedMaterials.filter(m => m.type === 'fitting').length
            },
            materials: processedMaterials.map(material => ({
                articleNo: material.articleNo,
                description: material.description,
                unit: material.unit || 'PC',
                shaftQuantities: material.shaftQuantities || {},
                totalQuantity: material.quantity || 0
            })),
            shafts: shafts,
            detailedMaterials: processedMaterials
        };

        // Add calculations if requested
        if (includeCalculations) {
            data.calculations = {
                'Total Materials Processed': processedMaterials.length,
                'Total Shafts': shafts.length,
                'Average Materials per Shaft': (processedMaterials.length / shafts.length).toFixed(2),
                'Materials with Quantities': processedMaterials.filter(m => m.quantity > 0).length,
                'Materials without Quantities': processedMaterials.filter(m => !m.quantity || m.quantity === 0).length,
                summary: {
                    'Total Pipe Length': processedMaterials
                        .filter(m => m.type === 'pipe')
                        .reduce((sum, m) => sum + (m.length || 0), 0).toFixed(2) + ' m',
                    'Total Fittings Count': processedMaterials
                        .filter(m => m.type === 'fitting')
                        .reduce((sum, m) => sum + (m.quantity || 0), 0),
                    'Processing Date': new Date().toISOString().split('T')[0]
                }
            };
        }
        
        if (outputPath) {
            // Save to file
            await excelGenerator.generateMultiSheetExcel(data, outputPath);
            res.json({
                success: true,
                message: 'Multi-sheet Excel file generated successfully',
                filePath: outputPath,
                worksheets: Object.keys(data).filter(key => data[key])
            });
        } else {
            // Return as buffer for download
            const excelBuffer = await excelGenerator.generateMultiSheetExcel(data);

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=geb-materials-multi.xlsx');
            res.setHeader('Content-Length', excelBuffer.length);

            res.send(excelBuffer);
        }

    } catch (error) {
        console.error('Error generating multi-sheet Excel file:', error);
        res.status(500).json({ 
            error: 'Failed to generate multi-sheet Excel file', 
            details: error.message 
        });
    }
});

// GET /api/materials - Get processed materials
router.get('/materials', (req, res) => {
    try {
        const { shaft, type, limit = 100 } = req.query;

        let filteredMaterials = [...processedMaterials];

        // Filter by shaft if specified
        if (shaft) {
            filteredMaterials = filteredMaterials.filter(material => 
                material.shaftNumber === shaft
            );
        }

        // Filter by type if specified
        if (type) {
            filteredMaterials = filteredMaterials.filter(material => 
                material.type === type
            );
        }

        // Apply limit
        filteredMaterials = filteredMaterials.slice(0, parseInt(limit));

        res.json({
            success: true,
            data: {
                materials: filteredMaterials,
                total: filteredMaterials.length,
                totalProcessed: processedMaterials.length
            }
        });

    } catch (error) {
        console.error('Error retrieving materials:', error);
        res.status(500).json({ error: 'Failed to retrieve materials', details: error.message });
    }
});

// GET /api/entities - Get processed CAD entities
router.get('/entities', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                entities: processedEntities,
                polylines: processedEntities.polylines?.length || 0,
                circles: processedEntities.circles?.length || 0,
                blocks: processedEntities.blocks?.length || 0
            }
        });

    } catch (error) {
        console.error('Error retrieving entities:', error);
        res.status(500).json({ error: 'Failed to retrieve entities', details: error.message });
    }
});

// DELETE /api/materials - Clear processed materials
router.delete('/materials', (req, res) => {
    try {
        processedMaterials = [];
        processedEntities = [];
        
        res.json({
            success: true,
            message: 'All processed materials and entities cleared'
        });

    } catch (error) {
        console.error('Error clearing materials:', error);
        res.status(500).json({ error: 'Failed to clear materials', details: error.message });
    }
});

module.exports = router;