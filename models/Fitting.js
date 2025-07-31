//Logic conversion from C# file Fitting.cs

const SanitaryMaterial = require('./SanitaryMaterial');

class Fitting extends SanitaryMaterial {
    constructor() {
        super();
        this.diameter = 0;
        this.fittingType = ''; // 'bend', 'branch', 'coupling', 'reducer', etc.
        this.angle = 0; // For bends (45, 88.5, etc.)
        this.connectionType = ''; // 'socket', 'electrofusion', etc.
        this.position = null; // Position in the drawing
        this.isConnected = false;
        this.connectedPipes = []; // Array of connected pipe IDs
    }

    // Set fitting type and properties
    setFittingType(type, angle = 0) {
        this.fittingType = type;
        this.angle = angle;
        return this;
    }

    // Set diameter
    setDiameter(diameter) {
        this.diameter = diameter;
        return this;
    }

    // Set position
    setPosition(x, y, z = 0) {
        this.position = { x, y, z };
        return this;
    }

    // Check if fitting is a bend
    isBend() {
        return this.fittingType === 'bend';
    }

    // Check if fitting is a branch
    isBranch() {
        return this.fittingType === 'branch';
    }

    // Check if fitting is a coupling
    isCoupling() {
        return this.fittingType === 'coupling';
    }

    // Check if fitting is a reducer
    isReducer() {
        return this.fittingType === 'reducer';
    }

    // Get fitting description based on type and properties
    getFittingDescription() {
        let description = '';
        
        switch (this.fittingType) {
            case 'bend':
                description = `bend PE-HD ${this.angle}G d${this.diameter}`;
                break;
            case 'branch':
                description = `branch fitting PE-HD ${this.angle}G d${this.diameter}`;
                break;
            case 'coupling':
                description = `electrofusion sleeve coupling PE-HD d${this.diameter}`;
                break;
            case 'reducer':
                description = `reducer PE-HD d${this.diameter}`;
                break;
            default:
                description = `${this.fittingType} d${this.diameter}`;
        }
        
        return description;
    }

    // Add connected pipe
    addConnectedPipe(pipeId) {
        if (!this.connectedPipes.includes(pipeId)) {
            this.connectedPipes.push(pipeId);
        }
        return this;
    }

    // Remove connected pipe
    removeConnectedPipe(pipeId) {
        this.connectedPipes = this.connectedPipes.filter(id => id !== pipeId);
        return this;
    }

    // Check if fitting is connected to a specific pipe
    isConnectedToPipe(pipeId) {
        return this.connectedPipes.includes(pipeId);
    }

    // Get connection count
    getConnectionCount() {
        return this.connectedPipes.length;
    }

    // Check if fitting is properly connected (should have at least 2 connections for most types)
    isProperlyConnected() {
        switch (this.fittingType) {
            case 'bend':
                return this.connectedPipes.length >= 2;
            case 'branch':
                return this.connectedPipes.length >= 3;
            case 'coupling':
                return this.connectedPipes.length >= 2;
            case 'reducer':
                return this.connectedPipes.length >= 2;
            default:
                return this.connectedPipes.length > 0;
        }
    }

    // Create fitting from object
    static fromObject(obj) {
        const fitting = new Fitting();
        Object.assign(fitting, obj);
        return fitting;
    }

    // Create fitting with basic properties
    static create(articleNo, description, diameter, fittingType, shaftNumber = '') {
        const fitting = new Fitting();
        fitting.articleNo = articleNo;
        fitting.description = description;
        fitting.diameter = diameter;
        fitting.fittingType = fittingType;
        fitting.shaftNumber = shaftNumber;
        fitting.unitType = 'PC';
        fitting.quantity = 1;
        return fitting;
    }

    // Create bend fitting
    static createBend(articleNo, diameter, angle, shaftNumber = '') {
        const fitting = new Fitting();
        fitting.articleNo = articleNo;
        fitting.diameter = diameter;
        fitting.fittingType = 'bend';
        fitting.angle = angle;
        fitting.shaftNumber = shaftNumber;
        fitting.unitType = 'PC';
        fitting.quantity = 1;
        fitting.description = fitting.getFittingDescription();
        return fitting;
    }

    // Create branch fitting
    static createBranch(articleNo, diameter, angle, shaftNumber = '') {
        const fitting = new Fitting();
        fitting.articleNo = articleNo;
        fitting.diameter = diameter;
        fitting.fittingType = 'branch';
        fitting.angle = angle;
        fitting.shaftNumber = shaftNumber;
        fitting.unitType = 'PC';
        fitting.quantity = 1;
        fitting.description = fitting.getFittingDescription();
        return fitting;
    }
}

module.exports = Fitting;