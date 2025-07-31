//Logic conversion from C# file Pipe.cs
const SanitaryMaterial = require('./SanitaryMaterial');

class Pipe extends SanitaryMaterial {
    constructor() {
        super();
        this.length = 0;
        this.diameter = 0;
        this.startPoint = null;
        this.endPoint = null;
        this.vertices = [];
        this.isConnected = false;
        this.connectionType = ''; // 'start', 'end', 'both'
    }

    // Set pipe geometry
    setGeometry(startPoint, endPoint, vertices = []) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.vertices = vertices;
        this.calculateLength();
        return this;
    }

    // Calculate pipe length
    calculateLength() {
        if (!this.startPoint || !this.endPoint) {
            this.length = 0;
            return this;
        }

        // Calculate total length including all vertices
        let totalLength = 0;
        let currentPoint = this.startPoint;

        for (const vertex of this.vertices) {
            totalLength += this.calculateDistance(currentPoint, vertex);
            currentPoint = vertex;
        }

        totalLength += this.calculateDistance(currentPoint, this.endPoint);
        this.length = totalLength;
        return this;
    }

    // Calculate distance between two points
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Set pipe diameter
    setDiameter(diameter) {
        this.diameter = diameter;
        return this;
    }

    // Check if pipe has specific diameter
    hasDiameter(diameter) {
        return this.diameter === diameter;
    }

    // Check if pipe is connected to another pipe
    isConnectedTo(otherPipe) {
        if (!otherPipe) return false;
        
        const tolerance = 0.5; // Tolerance for connection check
        
        // Check if start point connects to other pipe
        if (this.isPointNear(otherPipe.startPoint, tolerance) || 
            this.isPointNear(otherPipe.endPoint, tolerance)) {
            return true;
        }
        
        // Check if end point connects to other pipe
        if (this.isPointNear(otherPipe.startPoint, tolerance) || 
            this.isPointNear(otherPipe.endPoint, tolerance)) {
            return true;
        }
        
        return false;
    }

    // Check if point is near this pipe
    isPointNear(point, tolerance = 0.5) {
        if (!point) return false;
        
        // Check distance to start and end points
        const distToStart = this.calculateDistance(point, this.startPoint);
        const distToEnd = this.calculateDistance(point, this.endPoint);
        
        return distToStart <= tolerance || distToEnd <= tolerance;
    }

    // Get pipe type based on diameter
    getPipeType() {
        if (this.diameter === 50) return '50mm';
        if (this.diameter === 75) return '75mm';
        if (this.diameter === 110) return '110mm';
        return 'unknown';
    }

    // Create pipe from object
    static fromObject(obj) {
        const pipe = new Pipe();
        Object.assign(pipe, obj);
        return pipe;
    }

    // Create pipe with basic properties
    static create(articleNo, description, diameter, length, shaftNumber = '') {
        const pipe = new Pipe();
        pipe.articleNo = articleNo;
        pipe.description = description;
        pipe.diameter = diameter;
        pipe.length = length;
        pipe.shaftNumber = shaftNumber;
        pipe.unitType = 'M';
        pipe.quantity = length;
        return pipe;
    }
}

module.exports = Pipe;