//Logic conversion from C# file PipeSheet.cs

class PipeSheet {
    constructor() {
        this.pipeType = 'Sunken'; // Default pipe type
        this.wcDia110 = 0;
        this.washbasinDia50 = 0;
        this.mtDia110 = 0;
        this.collectorDia110 = 0;
    }

    // Set pipe type (Sunken or Under Slung)
    setPipeType(type) {
        if (type === 'Sunken' || type === 'Under Slung') {
            this.pipeType = type;
            return this;
        }
        throw new Error('Invalid pipe type. Must be "Sunken" or "Under Slung"');
    }

    // Set dimensions for Sunken pipe type
    setSunkenDimensions(wcDia110, washbasinDia50, mtDia110, collectorDia110) {
        this.pipeType = 'Sunken';
        this.wcDia110 = wcDia110;
        this.washbasinDia50 = washbasinDia50;
        this.mtDia110 = mtDia110;
        this.collectorDia110 = collectorDia110;
        return this;
    }

    // Set dimensions for Under Slung pipe type
    setUnderSlungDimensions(wcDia110, washbasinDia50, mtDia110, collectorDia110) {
        this.pipeType = 'Under Slung';
        this.wcDia110 = wcDia110;
        this.washbasinDia50 = washbasinDia50;
        this.mtDia110 = mtDia110;
        this.collectorDia110 = collectorDia110;
        return this;
    }

    // Get diameter based on pipe type and sanitary type
    getDiameter(sanitaryType) {
        switch (sanitaryType.toLowerCase()) {
            case 'wc':
            case 'water closet':
                return this.wcDia110;
            case 'washbasin':
            case 'wash basin':
                return this.washbasinDia50;
            case 'mt':
            case 'manhole':
                return this.mtDia110;
            case 'collector':
                return this.collectorDia110;
            default:
                return 0;
        }
    }

    // Validate pipe sheet configuration
    isValid() {
        return this.pipeType && 
               this.wcDia110 > 0 && 
               this.washbasinDia50 > 0 && 
               this.mtDia110 > 0 && 
               this.collectorDia110 > 0;
    }

    // Get configuration as object
    toObject() {
        return {
            pipeType: this.pipeType,
            wcDia110: this.wcDia110,
            washbasinDia50: this.washbasinDia50,
            mtDia110: this.mtDia110,
            collectorDia110: this.collectorDia110
        };
    }

    // Create from object
    static fromObject(obj) {
        const pipeSheet = new PipeSheet();
        Object.assign(pipeSheet, obj);
        return pipeSheet;
    }
}

module.exports = PipeSheet;