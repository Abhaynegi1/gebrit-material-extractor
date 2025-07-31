//C# code logic conversion from SelectionSetUtil.cs (geometry calculations, angle checks, intersection logic)

class GeometryUtils {
    // Calculate distance between two points
    static calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if a point is near another point (within tolerance)
    static isPointNear(point1, point2, tolerance = 0.5) {
        return this.calculateDistance(point1, point2) <= tolerance;
    }

    // Get polyline vertices (assuming polyline has vertices array)
    static getPolylineVertices(polyline) {
        return polyline.vertices || [];
    }

    // Calculate polyline length
    static calculatePolylineLength(polyline) {
        const vertices = this.getPolylineVertices(polyline);
        if (vertices.length < 2) return 0;

        let totalLength = 0;
        for (let i = 0; i < vertices.length - 1; i++) {
            totalLength += this.calculateDistance(vertices[i], vertices[i + 1]);
        }
        return totalLength;
    }

    // Check if polyline has 45-degree angle
    static has45DegreeAngle(polyline) {
        const vertices = this.getPolylineVertices(polyline);
        if (vertices.length < 3) return false;

        for (let i = 1; i < vertices.length - 1; i++) {
            const angle = this.calculateAngle(vertices[i - 1], vertices[i], vertices[i + 1]);
            if (Math.abs(angle - 45) < 5) { // 5-degree tolerance
                return true;
            }
        }
        return false;
    }

    // Calculate angle between three points
    static calculateAngle(point1, point2, point3) {
        const v1 = { x: point1.x - point2.x, y: point1.y - point2.y };
        const v2 = { x: point3.x - point2.x, y: point3.y - point2.y };
        
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        const cosAngle = dot / (mag1 * mag2);
        return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
    }

    // Check if two polylines intersect (simplified)
    static polylinesIntersect(poly1, poly2) {
        const vertices1 = this.getPolylineVertices(poly1);
        const vertices2 = this.getPolylineVertices(poly2);

        for (let i = 0; i < vertices1.length - 1; i++) {
            for (let j = 0; j < vertices2.length - 1; j++) {
                if (this.linesIntersect(vertices1[i], vertices1[i + 1], vertices2[j], vertices2[j + 1])) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if two line segments intersect
    static linesIntersect(p1, p2, p3, p4) {
        // Simplified line intersection check
        // In practice, you might want a more robust implementation
        return false; // Placeholder
    }
}

module.exports = GeometryUtils;