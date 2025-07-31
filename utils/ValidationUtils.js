//C# code logic conversion from MainForm.cs (validation methods like ValidateRequiredSanitaryValues) SelectionSetUtil.cs (validation of entities and materials)

class ValidationUtils {
    // Validate required sanitary values (based on pipe type)
    static validateRequiredSanitaryValues(pipeSheet) {
        const errors = [];

        if (!pipeSheet.pipeType) {
            errors.push('Pipe type is required');
        }

        if (pipeSheet.pipeType === 'Sunken' || pipeSheet.pipeType === 'Under Slung') {
            if (pipeSheet.wcDia110 <= 0) {
                errors.push('WC Dia 110 must be greater than 0');
            }
            if (pipeSheet.washbasinDia50 <= 0) {
                errors.push('Washbasin Dia 50 must be greater than 0');
            }
            if (pipeSheet.mtDia110 <= 0) {
                errors.push('MT Dia 110 must be greater than 0');
            }
            if (pipeSheet.collectorDia110 <= 0) {
                errors.push('Collector Dia 110 must be greater than 0');
            }
        } else {
            errors.push('Invalid pipe type. Must be "Sunken" or "Under Slung"');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validate pipe type
    static validatePipeType(pipeType) {
        const validTypes = ['Sunken', 'Under Slung'];
        return validTypes.includes(pipeType);
    }

    // Validate material object
    static validateMaterial(material) {
        const errors = [];

        if (!material.articleNo) {
            errors.push('Article number is required');
        }
        if (!material.description) {
            errors.push('Description is required');
        }
        if (material.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }
        if (!material.unitType) {
            errors.push('Unit type is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validate pipe object
    static validatePipe(pipe) {
        const materialValidation = this.validateMaterial(pipe);
        const errors = [...materialValidation.errors];

        if (pipe.diameter <= 0) {
            errors.push('Pipe diameter must be greater than 0');
        }
        if (pipe.length < 0) {
            errors.push('Pipe length cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validate fitting object
    static validateFitting(fitting) {
        const materialValidation = this.validateMaterial(fitting);
        const errors = [...materialValidation.errors];

        if (fitting.diameter <= 0) {
            errors.push('Fitting diameter must be greater than 0');
        }
        if (!fitting.fittingType) {
            errors.push('Fitting type is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validate shaft number format
    static validateShaftNumber(shaftNumber) {
        if (!shaftNumber) return false;
        
        // Check if shaft number follows pattern SH-XX
        const shaftPattern = /^SH-\d{1,2}$/;
        return shaftPattern.test(shaftNumber);
    }

    // Validate layer name (must start with GEB)
    static validateLayerName(layerName) {
        return layerName && layerName.startsWith('GEB');
    }

    // Comprehensive validation for the entire material extraction process
    static validateExtractionInput(data) {
        const errors = [];

        if (!data.pipeSheet) {
            errors.push('Pipe sheet configuration is required');
        } else {
            const pipeSheetValidation = this.validateRequiredSanitaryValues(data.pipeSheet);
            errors.push(...pipeSheetValidation.errors);
        }

        if (!data.entities || data.entities.length === 0) {
            errors.push('At least one entity is required for processing');
        }

        if (!data.shafts || data.shafts.length === 0) {
            errors.push('At least one shaft is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = ValidationUtils;