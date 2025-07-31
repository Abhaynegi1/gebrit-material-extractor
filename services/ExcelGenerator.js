//C# code logic conversion from SelectionSetUtil.cs
// services/ExcelGenerator.js
const ExcelJS = require('exceljs');
const path = require('path');

class ExcelGenerator {
    constructor() {
        this.startRow = 14;
        this.startCol = 1;
        this.seqNo = 1;
        this.iCol = 2;
        this.articleNo = '';
        this.desc = '';
        this.unit = '';
    }

    /**
     * Main method to generate Excel file
     * @param {Array} materials - Array of SanitaryMaterial objects
     * @param {Array} shafts - Array of shaft numbers
     * @param {string} outputPath - Output file path
     * @returns {Promise<Buffer>} - Excel file as buffer
     */
    async generateExcel(materials, shafts, outputPath = null) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Materials');

            // Set up workbook properties
            workbook.creator = 'GEB Material Extractor';
            workbook.lastModifiedBy = 'GEB Material Extractor';
            workbook.created = new Date();
            workbook.modified = new Date();

            // Write headers and material data
            this.writeHeadersInfoToExcel(worksheet, shafts);
            this.writeWashBasinInfoToExcel(worksheet, materials);
            this.writeUrinalsInfoToExcel(worksheet, materials);
            this.writeShowerFloorDrainInfoToExcel(worksheet, materials);
            this.writeBathTubInfoToExcel(worksheet, materials);
            this.writeWaterClosetInfoToExcel(worksheet, materials);
            this.writeVerticalShaftInfoToExcel(worksheet, materials);
            this.writeVentInfoToExcel(worksheet, materials);

            // Auto-fit columns
            this.autoFitColumns(worksheet);

            // Save to file if path provided, otherwise return buffer
            if (outputPath) {
                await workbook.xlsx.writeFile(outputPath);
                return null;
            } else {
                return await workbook.xlsx.writeBuffer();
            }

        } catch (error) {
            console.error('Error generating Excel file:', error);
            throw new Error(`Failed to generate Excel file: ${error.message}`);
        }
    }

    /**
     * Write headers information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} shafts - Array of shaft numbers
     */
    writeHeadersInfoToExcel(worksheet, shafts) {
        try {
            // Write the Headers
            const headerRow = worksheet.getRow(12);
            
            headerRow.getCell(1).value = 'Sr No.';
            headerRow.getCell(2).value = 'Article No.';
            headerRow.getCell(3).value = 'Description';
            headerRow.getCell(4).value = 'Qty Unit';

            // Add shaft columns
            for (let i = 0; i < shafts.length; i++) {
                headerRow.getCell(5 + i).value = shafts[i];
            }

            // Add total column
            headerRow.getCell(5 + shafts.length).value = 'Total Qty for One floor';

            // Style the header row
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Add borders to header cells
            for (let i = 1; i <= 5 + shafts.length; i++) {
                const cell = headerRow.getCell(i);
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }

        } catch (error) {
            console.error('Error writing headers to Excel:', error);
            throw error;
        }
    }

    /**
     * Write wash basin information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeWashBasinInfoToExcel(worksheet, materials) {
        try {
            const washbasins = this.getWashBasinCollection();
            this.startRow = 14;

            this.writeArticlesInfoToExcel(worksheet, washbasins, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'WASH BASIN/SINK');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, washbasins, currentRow, 'WASH BASIN');

        } catch (error) {
            console.error('Error writing wash basin info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write urinals information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeUrinalsInfoToExcel(worksheet, materials) {
        try {
            const urinals = this.getUrinalsCollection();
            this.startRow = this.getNextStartRow(worksheet);

            this.writeArticlesInfoToExcel(worksheet, urinals, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'URINALS');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, urinals, currentRow, 'URINALS');

        } catch (error) {
            console.error('Error writing urinals info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write shower floor drain information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeShowerFloorDrainInfoToExcel(worksheet, materials) {
        try {
            const showerFloorDrains = this.getShowerFloorDrainCollection();
            this.startRow = this.getNextStartRow(worksheet);

            this.writeArticlesInfoToExcel(worksheet, showerFloorDrains, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'SHOWER/FLOOR DRAIN');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, showerFloorDrains, currentRow, 'SHOWER/FLOOR DRAIN');

        } catch (error) {
            console.error('Error writing shower floor drain info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write bath tub information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeBathTubInfoToExcel(worksheet, materials) {
        try {
            const bathTubs = this.getBathTubCollection();
            this.startRow = this.getNextStartRow(worksheet);

            this.writeArticlesInfoToExcel(worksheet, bathTubs, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'BATH TUB');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, bathTubs, currentRow, 'BATH TUB');

        } catch (error) {
            console.error('Error writing bath tub info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write water closet information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeWaterClosetInfoToExcel(worksheet, materials) {
        try {
            const waterClosets = this.getWaterClosetCollection();
            this.startRow = this.getNextStartRow(worksheet);

            this.writeArticlesInfoToExcel(worksheet, waterClosets, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'WATER CLOSET');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, waterClosets, currentRow, 'WATER CLOSET');

        } catch (error) {
            console.error('Error writing water closet info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write vertical shaft information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeVerticalShaftInfoToExcel(worksheet, materials) {
        try {
            const verticalShafts = this.getVerticalShaftCollection();
            this.startRow = this.getNextStartRow(worksheet);

            this.writeArticlesInfoToExcel(worksheet, verticalShafts, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'VERTICAL SHAFT');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, verticalShafts, currentRow, 'VERTICAL SHAFT');

        } catch (error) {
            console.error('Error writing vertical shaft info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write vent information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of materials
     */
    writeVentInfoToExcel(worksheet, materials) {
        try {
            const vents = this.getVentCollection();
            this.startRow = this.getNextStartRow(worksheet);

            this.writeArticlesInfoToExcel(worksheet, vents, 1, this.startRow, 25, this.startRow, 'A13', 'D13', 'VENT');
            
            let currentRow = this.startRow;
            this.writeSanitaryValuesToExcel(worksheet, materials, vents, currentRow, 'VENT');

        } catch (error) {
            console.error('Error writing vent info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write articles information to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of material strings
     * @param {number} srNo - Starting sequence number
     * @param {number} startNum - Starting number
     * @param {number} endNum - Ending number
     * @param {number} startRow - Starting row
     * @param {string} rangeStart - Range start cell
     * @param {string} rangeEnd - Range end cell
     * @param {string} rangeTitle - Range title
     */
    writeArticlesInfoToExcel(worksheet, materials, srNo, startNum, endNum, startRow, rangeStart, rangeEnd, rangeTitle) {
        try {
            // Write range title
            const titleRow = worksheet.getRow(startRow - 1);
            titleRow.getCell(1).value = rangeTitle;
            titleRow.getCell(1).font = { bold: true };
            titleRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD0D0D0' }
            };

            // Write material articles
            for (let i = 0; i < materials.length; i++) {
                const material = materials[i];
                const parts = material.split('|');
                
                if (parts.length >= 3) {
                    const row = worksheet.getRow(startRow + i);
                    
                    row.getCell(1).value = srNo + i; // Sr No.
                    row.getCell(2).value = parts[0]; // Article No.
                    row.getCell(3).value = parts[2]; // Description
                    row.getCell(4).value = parts[1]; // Unit

                    // Add borders to cells
                    for (let j = 1; j <= 4; j++) {
                        const cell = row.getCell(j);
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }
                }
            }

        } catch (error) {
            console.error('Error writing articles info to Excel:', error);
            throw error;
        }
    }

    /**
     * Write sanitary values to Excel
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Array of SanitaryMaterial objects
     * @param {Array} sanitary - Array of sanitary strings
     * @param {number} currentRow - Current row number
     * @param {string} source - Source type
     */
    writeSanitaryValuesToExcel(worksheet, materials, sanitary, currentRow, source) {
        try {
            for (const sanitaryItem of sanitary) {
                const parts = sanitaryItem.split('|');
                const articleNo = parts[0];
                
                // Find matching materials
                const matchingMaterials = materials.filter(material => 
                    material.articleNo === articleNo && 
                    material.source === source
                );

                if (matchingMaterials.length > 0) {
                    for (const material of matchingMaterials) {
                        const row = worksheet.getRow(currentRow);
                        
                        row.getCell(1).value = this.seqNo++;
                        row.getCell(2).value = material.articleNo;
                        row.getCell(3).value = material.description;
                        row.getCell(4).value = material.unitType;
                        
                        // Add shaft-specific quantities
                        // This would need to be implemented based on your shaft structure
                        
                        // Add total quantity
                        row.getCell(5).value = material.quantity;

                        // Add borders
                        for (let j = 1; j <= 5; j++) {
                            const cell = row.getCell(j);
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        }

                        currentRow++;
                    }
                }
            }

        } catch (error) {
            console.error('Error writing sanitary values to Excel:', error);
            throw error;
        }
    }

    /**
     * Get next start row for new section
     * @param {Object} worksheet - Excel worksheet
     * @returns {number} - Next start row
     */
    getNextStartRow(worksheet) {
        // Find the last used row and add some spacing
        const lastRow = worksheet.rowCount;
        return lastRow + 3; // Add 3 rows spacing
    }

    /**
     * Auto-fit columns
     * @param {Object} worksheet - Excel worksheet
     */
    autoFitColumns(worksheet) {
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const length = cell.value ? cell.value.toString().length : 10;
                if (length > maxLength) {
                    maxLength = length;
                }
            });
            column.width = Math.min(maxLength + 2, 50); // Max width of 50
        });
    }

    // Material collection methods (from SanitaryObjectsCollections.cs)
    getWashBasinCollection() {
        return [
            "152.682.00.1|PC|sleeve EPDM for d50 50IRHD",
            "152.796.00.1|PC|sleeve EPDM for d50 60IRHD",
            "152.742.11.1|PC|drain assembly for cast iron 1 1/2''x40",
            "361.802.92.1|PC|protective cap for pipe end PE-HD d50",
            "361.000.16.0|M|pipe PE-HD d50x3 L5000",
            "361.045.16.1|PC|bend PE-HD 45G d50 L4.5",
            "361.088.16.1|PC|bend PE-HD 88.5G d50 L6",
            "361.112.16.1|PC|Geberit HDPE Y-branch fitting 45°, dia.50/50",
            "361.162.16.1|PC|branch fitting PE-HD 88.5G d50/50",
            "367.560.16.1|PC|reducer PE-HD d110/50 concentric",
            "361.771.16.1|PC|electrofusion sleeve coupling PE-HD d50"
        ];
    }

    getUrinalsCollection() {
        return [
            "152.689.00.1|PC|sleeve EPDM for d56 50IRHD",
            "363.000.16.0|M|pipe PE-HD d56x3 L500",
            "363.045.16.1|PC|bend PE-HD 45G d56 L4.5",
            "363.088.16.1|PC|bend PE-HD 88.5G d56 L6.5",
            "363.115.16.1|PC|branch fitting PE-HD 45G d56/56",
            "363.165.16.1|PC|branch fitting PE-HD 88.5G d56/56",
            "363.771.16.1|PC|electrofusion sleeve coupling PE-HD d56"
        ];
    }

    getShowerFloorDrainCollection() {
        return [
            "388.008.00.1|PC|Geberit collector drain",
            "367.802.92.1|PC|protective cap for pipe end PE-HD d110",
            "367.000.16.0|M|pipe PE-HD d110x4.3 L500",
            "365.000.16.0|M|pipe PE-HD d75x3 L500",
            "365.045.16.1|PC|bend PE-HD 45G d75 L5",
            "365.088.16.1|PC|bend PE-HD 88.5G d75 L7.5",
            "365.115.16.1|PC|branch fitting PE-HD 45G d75/56",
            "365.125.16.1|PC|branch fitting PE-HD 45G d75/75",
            "365.771.16.1|PC|electrofusion sleeve coupling PE-HD d75"
        ];
    }

    getBathTubCollection() {
        return [
            "152.693.00.1|PC|sleeve EPDM for d63 50IRHD",
            "364.000.16.0|M|pipe PE-HD d63x3 L500",
            "364.730.16.1|PC|tubular trap PE-HD d63",
            "364.779.16.3|PC|Geberit HDPE ring seal socket with lip seal: d=63mm",
            "364.045.16.1|PC|bend PE-HD 45G d63 L5",
            "365.571.16.1|PC|reducer PE-HD d75/63 L8 eccentric",
            "365.120.16.1|PC|branch fitting PE-HD 45G d75/63",
            "364.771.16.1|PC|electrofusion sleeve coupling PE-HD d63"
        ];
    }

    getWaterClosetCollection() {
        return [
            "367.000.16.0|M|pipe PE-HD d110x4.3 L500",
            "367.045.16.1|PC|bend PE-HD 45G d110 L6",
            "367.088.16.1|PC|bend PE-HD 88.5G d110 L9.5",
            "367.576.16.1|PC|reducer PE-HD d110/75 L8 eccentric",
            "367.115.16.1|PC|branch fitting PE-HD 45G d110/110",
            "367.125.16.1|PC|branch fitting PE-HD 88.5G d110/110",
            "367.771.16.1|PC|electrofusion sleeve coupling PE-HD d110"
        ];
    }

    getVerticalShaftCollection() {
        return [
            "367.000.16.0|M|pipe PE-HD d110x4.3 L500",
            "367.045.16.1|PC|bend PE-HD 45G d110 L6",
            "367.088.16.1|PC|bend PE-HD 88.5G d110 L9.5",
            "367.771.16.1|PC|electrofusion sleeve coupling PE-HD d110"
        ];
    }

    getVentCollection() {
        return [
            "367.000.16.0|M|pipe PE-HD d110x4.3 L500",
            "367.045.16.1|PC|bend PE-HD 45G d110 L6",
            "367.088.16.1|PC|bend PE-HD 88.5G d110 L9.5",
            "367.771.16.1|PC|electrofusion sleeve coupling PE-HD d110"
        ];
    }

    /**
     * Generate Excel with multiple worksheets
     * @param {Object} data - Data organized by worksheet
     * @param {string} outputPath - Optional output file path
     * @returns {Promise<Buffer|null>} - Excel file as buffer or null if saved to file
     */
    async generateMultiSheetExcel(data, outputPath = null) {
        try {
            const workbook = new ExcelJS.Workbook();
            
            // Set up workbook properties
            workbook.creator = 'GEB Material Extractor';
            workbook.lastModifiedBy = 'GEB Material Extractor';
            workbook.created = new Date();
            workbook.modified = new Date();
            
            // Create summary worksheet
            if (data.summary) {
                const summarySheet = workbook.addWorksheet('Summary');
                this.writeSummarySheet(summarySheet, data.summary);
            }
            
            // Create materials worksheet
            if (data.materials && data.shafts) {
                const materialsSheet = workbook.addWorksheet('Materials');
                this.writeMaterialsSheet(materialsSheet, data.materials, data.shafts);
            }
            
            // Create calculations worksheet
            if (data.calculations) {
                const calculationsSheet = workbook.addWorksheet('Calculations');
                this.writeCalculationsSheet(calculationsSheet, data.calculations);
            }
            
            // Create detailed materials worksheet (original format)
            if (data.detailedMaterials && data.shafts) {
                const detailedSheet = workbook.addWorksheet('Detailed Materials');
                this.writeDetailedMaterialsSheet(detailedSheet, data.detailedMaterials, data.shafts);
            }
            
            // Auto-fit columns for all worksheets
            workbook.worksheets.forEach(worksheet => {
                this.autoFitColumns(worksheet);
            });
            
            // Save to file if path provided, otherwise return buffer
            if (outputPath) {
                await workbook.xlsx.writeFile(outputPath);
                return null;
            } else {
                return await workbook.xlsx.writeBuffer();
            }
            
        } catch (error) {
            console.error('Error generating multi-sheet Excel file:', error);
            throw new Error(`Failed to generate multi-sheet Excel file: ${error.message}`);
        }
    }

    /**
     * Write summary sheet
     * @param {Object} worksheet - Excel worksheet
     * @param {Object} summaryData - Summary data
     */
    writeSummarySheet(worksheet, summaryData) {
        // Write title
        worksheet.getCell('A1').value = 'GEB Material Summary';
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Merge title cell
        worksheet.mergeCells('A1:D1');
        
        // Write summary information
        const summaryRows = [
            { label: 'Total Materials:', value: summaryData.totalMaterials || 0 },
            { label: 'Total Quantity:', value: summaryData.totalQuantity || 0 },
            { label: 'Total Pipes:', value: summaryData.totalPipes || 0 },
            { label: 'Total Fittings:', value: summaryData.totalFittings || 0 },
            { label: 'Generated Date:', value: new Date().toLocaleDateString() },
            { label: 'Generated Time:', value: new Date().toLocaleTimeString() }
        ];
        
        let row = 3;
        for (const item of summaryRows) {
            worksheet.getCell(`A${row}`).value = item.label;
            worksheet.getCell(`A${row}`).font = { bold: true };
            worksheet.getCell(`B${row}`).value = item.value;
            row++;
        }
        
        // Add borders to summary table
        for (let i = 3; i < row; i++) {
            worksheet.getCell(`A${i}`).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell(`B${i}`).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    /**
     * Write materials sheet (simplified version)
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Materials data
     * @param {Array} shafts - Shaft numbers
     */
    writeMaterialsSheet(worksheet, materials, shafts) {
        // Write headers
        const headerRow = worksheet.getRow(1);
        headerRow.getCell(1).value = 'Article No.';
        headerRow.getCell(2).value = 'Description';
        headerRow.getCell(3).value = 'Unit';
        
        // Add shaft columns
        for (let i = 0; i < shafts.length; i++) {
            headerRow.getCell(4 + i).value = shafts[i];
        }
        
        // Add total column
        headerRow.getCell(4 + shafts.length).value = 'Total';
        
        // Style headers
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        
        // Write materials data
        let row = 2;
        for (const material of materials) {
            worksheet.getCell(`A${row}`).value = material.articleNo || '';
            worksheet.getCell(`B${row}`).value = material.description || '';
            worksheet.getCell(`C${row}`).value = material.unit || 'PC';
            
            // Add shaft quantities
            for (let i = 0; i < shafts.length; i++) {
                const shaftQty = material.shaftQuantities?.[shafts[i]] || 0;
                worksheet.getCell(`${4 + i}${row}`).value = shaftQty;
            }
            
            // Add total
            const total = material.totalQuantity || 0;
            worksheet.getCell(`${4 + shafts.length}${row}`).value = total;
            
            row++;
        }
    }

    /**
     * Write detailed materials sheet (original format)
     * @param {Object} worksheet - Excel worksheet
     * @param {Array} materials - Materials data
     * @param {Array} shafts - Shaft numbers
     */
    writeDetailedMaterialsSheet(worksheet, materials, shafts) {
        // Use the existing detailed format
        this.writeHeadersInfoToExcel(worksheet, shafts);
        this.writeWashBasinInfoToExcel(worksheet, materials);
        this.writeUrinalsInfoToExcel(worksheet, materials);
        this.writeShowerFloorDrainInfoToExcel(worksheet, materials);
        this.writeBathTubInfoToExcel(worksheet, materials);
        this.writeWaterClosetInfoToExcel(worksheet, materials);
        this.writeVerticalShaftInfoToExcel(worksheet, materials);
        this.writeVentInfoToExcel(worksheet, materials);
    }

    /**
     * Write calculations sheet
     * @param {Object} worksheet - Excel worksheet
     * @param {Object} calculations - Calculation data
     */
    writeCalculationsSheet(worksheet, calculations) {
        // Write title
        worksheet.getCell('A1').value = 'Material Calculations';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Merge title cell
        worksheet.mergeCells('A1:C1');
        
        // Write calculation details
        let row = 3;
        for (const [key, value] of Object.entries(calculations)) {
            worksheet.getCell(`A${row}`).value = key;
            worksheet.getCell(`A${row}`).font = { bold: true };
            worksheet.getCell(`B${row}`).value = value;
            
            // Add borders
            worksheet.getCell(`A${row}`).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell(`B${row}`).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            row++;
        }
        
        // Add summary calculations
        if (calculations.summary) {
            row++;
            worksheet.getCell(`A${row}`).value = 'Summary Calculations';
            worksheet.getCell(`A${row}`).font = { bold: true, size: 12 };
            row++;
            
            for (const [key, value] of Object.entries(calculations.summary)) {
                worksheet.getCell(`A${row}`).value = key;
                worksheet.getCell(`B${row}`).value = value;
                row++;
            }
        }
    }
}

module.exports = ExcelGenerator;