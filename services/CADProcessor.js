// services/CADProcessor.js
const fs = require('fs-extra');
const path = require('path');
const DxfParser = require('dxf-parser');

// Import utility classes
const SelectionFilter = require('../utils/SelectionFilter');
const GeometryCalculator = require('../utils/GeometryCalculator');
const BlockProcessor = require('../utils/BlockProcessor');

class CADProcessor {
    constructor() {
        this.supportedFormats = ['.dxf', '.dwg'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        
        // Initialize utility classes
        this.selectionFilter = new SelectionFilter();
        this.geometryCalculator = new GeometryCalculator();
        this.blockProcessor = new BlockProcessor();
    }

    /**
     * Main method to process CAD files
     * @param {string} filePath - Path to the uploaded file
     * @returns {Promise<Object>} - Processed entities
     */
    async processCADFile(filePath) {
        try {
            const fileExtension = path.extname(filePath).toLowerCase();
            
            if (!this.supportedFormats.includes(fileExtension)) {
                throw new Error(`Unsupported file format: ${fileExtension}`);
            }

            // Check file size
            const stats = await fs.stat(filePath);
            if (stats.size > this.maxFileSize) {
                throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
            }

            let entities;
            if (fileExtension === '.dxf') {
                entities = await this.processDXF(filePath);
            } else if (fileExtension === '.dwg') {
                entities = await this.processDWG(filePath);
            }

            return this.filterAndProcessEntities(entities);

        } catch (error) {
            console.error('Error processing CAD file:', error);
            throw error;
        }
    }

    /**
     * Process DXF files using dxf-parser library
     * @param {string} filePath - Path to DXF file
     * @returns {Promise<Object>} - Parsed entities
     */
    async processDXF(filePath) {
        try {
            const dxfString = await fs.readFile(filePath, 'utf-8');
            const parser = new DxfParser();
            const dxf = parser.parseSync(dxfString);

            if (!dxf.entities || !Array.isArray(dxf.entities)) {
                throw new Error('Invalid DXF file: No entities found');
            }

            return this.extractEntitiesFromDXF(dxf);

        } catch (error) {
            console.error('Error processing DXF file:', error);
            throw new Error(`Failed to process DXF file: ${error.message}`);
        }
    }

    /**
     * Process DWG files (convert to DXF first or use cloud API)
     * @param {string} filePath - Path to DWG file
     * @returns {Promise<Object>} - Parsed entities
     */
    async processDWG(filePath) {
        try {
            // Option 1: Convert DWG to DXF using cloud service
            const dxfPath = await this.convertDWGtoDXF(filePath);
            const entities = await this.processDXF(dxfPath);
            
            // Clean up temporary DXF file
            await fs.remove(dxfPath);
            
            return entities;

        } catch (error) {
            console.error('Error processing DWG file:', error);
            throw new Error(`Failed to process DWG file: ${error.message}`);
        }
    }

    /**
     * Convert DWG to DXF using cloud service (placeholder implementation)
     * @param {string} dwgPath - Path to DWG file
     * @returns {Promise<string>} - Path to converted DXF file
     */
    async convertDWGtoDXF(dwgPath) {
        // This is a placeholder. In production, you would:
        // 1. Upload DWG to cloud service (e.g., AutoCAD Web API, Forge API)
        // 2. Convert to DXF
        // 3. Download the converted file
        
        throw new Error('DWG to DXF conversion not implemented. Please convert DWG to DXF manually or use a cloud service.');
        
        // Example implementation with cloud service:
        /*
        const cloudService = new CloudCADService();
        const dxfBuffer = await cloudService.convertDWGtoDXF(dwgPath);
        const dxfPath = dwgPath.replace('.dwg', '_converted.dxf');
        await fs.writeFile(dxfPath, dxfBuffer);
        return dxfPath;
        */
    }

    /**
     * Enhanced entity processing with AutoCAD-specific logic replacement
     * @param {Object} dxf - Parsed DXF data
     * @returns {Object} - Processed entities
     */
    extractEntitiesFromDXF(dxf) {
        // Use SelectionFilter instead of AutoCAD selection sets
        const filteredEntities = this.selectionFilter.filterEntitiesByLayer(dxf.entities);
        
        // Process each entity type with geometry calculations
        const processed = {
            polylines: this.processPolylines(filteredEntities.polylines),
            circles: this.processCircles(filteredEntities.circles),
            blocks: this.blockProcessor.processBlockFittings(filteredEntities.blocks),
            totalEntities: 0
        };

        processed.totalEntities = processed.polylines.length + 
                                processed.circles.length + 
                                processed.blocks.length;

        return processed;
    }

    /**
     * Process polylines with geometry calculations
     * @param {Array} polylines - Polyline entities
     * @returns {Array} - Processed polylines
     */
    processPolylines(polylines) {
        return polylines.map(polyline => {
            const processed = {
                ...polyline,
                length: this.geometryCalculator.calculatePolylineLength(polyline),
                has45DegreeAngle: this.geometryCalculator.has45DegreeAngle(polyline),
                diameter: this.estimatePipeDiameter(polyline),
                shaftNumber: this.selectionFilter.extractShaftNumber(polyline.layer)
            };

            return processed;
        });
    }

    /**
     * Process circles with geometry calculations
     * @param {Array} circles - Circle entities
     * @returns {Array} - Processed circles
     */
    processCircles(circles) {
        return circles.map(circle => {
            const processed = {
                ...circle,
                diameter: circle.radius * 2,
                area: Math.PI * circle.radius * circle.radius,
                shaftNumber: this.selectionFilter.extractShaftNumber(circle.layer)
            };

            return processed;
        });
    }

    /**
     * Process individual entity and add metadata
     * @param {Object} entity - Raw entity from DXF
     * @returns {Object|null} - Processed entity or null if filtered out
     */
    processEntity(entity) {
        // Filter by layer (only process GEB* layers)
        if (!this.selectionFilter.matchesLayerPattern(entity.layer)) {
            return null;
        }

        const processedEntity = {
            type: entity.type,
            layer: entity.layer,
            handle: entity.handle,
            color: entity.color,
            lineType: entity.lineType,
            ...this.extractEntityGeometry(entity)
        };

        return processedEntity;
    }



    /**
     * Extract geometry data from entity
     * @param {Object} entity - Raw entity
     * @returns {Object} - Geometry data
     */
    extractEntityGeometry(entity) {
        const geometry = {};

        switch (entity.type) {
            case 'LWPOLYLINE':
            case 'POLYLINE':
                geometry.vertices = this.extractPolylineVertices(entity);
                geometry.closed = entity.closed || false;
                geometry.length = this.calculatePolylineLength(geometry.vertices);
                break;

            case 'CIRCLE':
                geometry.center = { x: entity.center.x, y: entity.center.y, z: entity.center.z || 0 };
                geometry.radius = entity.radius;
                geometry.diameter = entity.radius * 2;
                geometry.area = Math.PI * entity.radius * entity.radius;
                break;

            case 'INSERT':
                geometry.insertionPoint = { x: entity.insertionPoint.x, y: entity.insertionPoint.y, z: entity.insertionPoint.z || 0 };
                geometry.blockName = entity.blockName;
                geometry.scale = entity.scale || { x: 1, y: 1, z: 1 };
                geometry.rotation = entity.rotation || 0;
                break;

            case 'LINE':
                geometry.startPoint = { x: entity.startPoint.x, y: entity.startPoint.y, z: entity.startPoint.z || 0 };
                geometry.endPoint = { x: entity.endPoint.x, y: entity.endPoint.y, z: entity.endPoint.z || 0 };
                geometry.length = this.calculateDistance(geometry.startPoint, geometry.endPoint);
                break;

            case 'ARC':
                geometry.center = { x: entity.center.x, y: entity.center.y, z: entity.center.z || 0 };
                geometry.radius = entity.radius;
                geometry.startAngle = entity.startAngle;
                geometry.endAngle = entity.endAngle;
                break;
        }

        return geometry;
    }

    /**
     * Extract vertices from polyline entity
     * @param {Object} polyline - Polyline entity
     * @returns {Array} - Array of vertex points
     */
    extractPolylineVertices(polyline) {
        const vertices = [];

        if (polyline.vertices) {
            for (const vertex of polyline.vertices) {
                vertices.push({
                    x: vertex.x,
                    y: vertex.y,
                    z: vertex.z || 0
                });
            }
        }

        return vertices;
    }



    /**
     * Filter and process entities for material extraction
     * @param {Object} entities - Raw entities
     * @returns {Object} - Processed entities ready for material calculation
     */
    filterAndProcessEntities(entities) {
        const processed = {
            polylines: [],
            circles: [],
            blocks: [],
            totalEntities: 0
        };

        // Process polylines (pipes)
        for (const polyline of entities.polylines) {
            if (this.isValidPipe(polyline)) {
                processed.polylines.push(this.enrichPipeData(polyline));
            }
        }

        // Process circles (fittings)
        for (const circle of entities.circles) {
            if (this.isValidFitting(circle)) {
                processed.circles.push(this.enrichFittingData(circle));
            }
        }

        // Process blocks (complex fittings)
        for (const block of entities.blocks) {
            if (this.isValidBlock(block)) {
                processed.blocks.push(this.enrichBlockData(block));
            }
        }

        processed.totalEntities = processed.polylines.length + processed.circles.length + processed.blocks.length;

        return processed;
    }

    /**
     * Check if polyline is a valid pipe
     * @param {Object} polyline - Polyline entity
     * @returns {boolean} - True if valid pipe
     */
    isValidPipe(polyline) {
        return polyline.vertices && 
               polyline.vertices.length >= 2 && 
               polyline.length > 0;
    }

    /**
     * Check if circle is a valid fitting
     * @param {Object} circle - Circle entity
     * @returns {boolean} - True if valid fitting
     */
    isValidFitting(circle) {
        return circle.radius > 0 && circle.radius < 1000; // Reasonable size limits
    }

    /**
     * Check if block is valid
     * @param {Object} block - Block entity
     * @returns {boolean} - True if valid block
     */
    isValidBlock(block) {
        return block.blockName && block.insertionPoint;
    }

    /**
     * Enrich pipe data with additional properties
     * @param {Object} polyline - Polyline entity
     * @returns {Object} - Enriched pipe data
     */
    enrichPipeData(polyline) {
        return {
            ...polyline,
            pipeType: this.determinePipeType(polyline),
            diameter: this.estimatePipeDiameter(polyline),
            shaftNumber: this.extractShaftNumber(polyline.layer)
        };
    }

    /**
     * Enrich fitting data with additional properties
     * @param {Object} circle - Circle entity
     * @returns {Object} - Enriched fitting data
     */
    enrichFittingData(circle) {
        return {
            ...circle,
            fittingType: this.determineFittingType(circle),
            diameter: this.estimateFittingDiameter(circle),
            shaftNumber: this.extractShaftNumber(circle.layer)
        };
    }

    /**
     * Enrich block data with additional properties
     * @param {Object} block - Block entity
     * @returns {Object} - Enriched block data
     */
    enrichBlockData(block) {
        return {
            ...block,
            blockType: this.determineBlockType(block),
            shaftNumber: this.extractShaftNumber(block.layer)
        };
    }

    /**
     * Determine pipe type based on properties
     * @param {Object} polyline - Polyline entity
     * @returns {string} - Pipe type
     */
    determinePipeType(polyline) {
        // Logic to determine if it's a main pipe, branch, etc.
        if (polyline.length > 100) return 'main';
        if (polyline.vertices.length > 2) return 'branch';
        return 'connection';
    }

    /**
     * Determine fitting type based on properties
     * @param {Object} circle - Circle entity
     * @returns {string} - Fitting type
     */
    determineFittingType(circle) {
        // Logic to determine fitting type based on radius and other properties
        if (circle.radius > 50) return 'elbow';
        if (circle.radius > 25) return 'tee';
        return 'coupling';
    }

    /**
     * Determine block type based on properties
     * @param {Object} block - Block entity
     * @returns {string} - Block type
     */
    determineBlockType(block) {
        // Logic to determine block type based on block name
        const blockName = block.blockName?.toLowerCase() || '';
        if (blockName.includes('valve')) return 'valve';
        if (blockName.includes('pump')) return 'pump';
        if (blockName.includes('tank')) return 'tank';
        return 'fitting';
    }

    /**
     * Estimate pipe diameter based on properties
     * @param {Object} polyline - Polyline entity
     * @returns {number} - Estimated diameter
     */
    estimatePipeDiameter(polyline) {
        // This would need to be calibrated based on your specific CAD standards
        // For now, return a default based on length or other properties
        if (polyline.length > 50) return 110;
        if (polyline.length > 20) return 75;
        return 50;
    }

    /**
     * Estimate fitting diameter based on properties
     * @param {Object} circle - Circle entity
     * @returns {number} - Estimated diameter
     */
    estimateFittingDiameter(circle) {
        // Estimate diameter based on circle radius
        return circle.radius * 2;
    }



    /**
     * Extract shaft number from layer name
     * @param {string} layerName - Layer name
     * @returns {string} - Shaft number
     */
    extractShaftNumber(layerName) {
        return this.selectionFilter.extractShaftNumber(layerName);
    }
}

module.exports = CADProcessor;