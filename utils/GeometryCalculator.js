// From SelectionSetUtil.cs
class GeometryCalculator {
    constructor() {
        this.tolerance = 0.5;
    }

    /**
     * Calculate distance between two points
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @returns {number} - Distance
     */
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = (point2.z || 0) - (point1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Check if point is touching polyline
     * @param {Object} polyline - Polyline entity
     * @param {Object} point - Point to check
     * @param {number} tolerance - Tolerance distance
     * @returns {boolean} - True if touching
     */
    isPointTouchingPolyline(polyline, point, tolerance = this.tolerance) {
        const vertices = polyline.vertices || [];
        
        for (let i = 0; i < vertices.length - 1; i++) {
            const segmentStart = vertices[i];
            const segmentEnd = vertices[i + 1];
            
            if (this.isPointOnLineSegment(point, segmentStart, segmentEnd, tolerance)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if point is on line segment
     * @param {Object} point - Point to check
     * @param {Object} lineStart - Line start point
     * @param {Object} lineEnd - Line end point
     * @param {number} tolerance - Tolerance distance
     * @returns {boolean} - True if on line segment
     */
    isPointOnLineSegment(point, lineStart, lineEnd, tolerance) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        if (lenSq === 0) return false;

        let param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= tolerance;
    }

    /**
     * Check if two polylines intersect
     * @param {Object} polyline1 - First polyline
     * @param {Object} polyline2 - Second polyline
     * @returns {boolean} - True if intersecting
     */
    polylinesIntersect(polyline1, polyline2) {
        const vertices1 = polyline1.vertices || [];
        const vertices2 = polyline2.vertices || [];

        for (let i = 0; i < vertices1.length - 1; i++) {
            const segment1Start = vertices1[i];
            const segment1End = vertices1[i + 1];

            for (let j = 0; j < vertices2.length - 1; j++) {
                const segment2Start = vertices2[j];
                const segment2End = vertices2[j + 1];

                if (this.lineSegmentsIntersect(segment1Start, segment1End, segment2Start, segment2End)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if two line segments intersect
     * @param {Object} p1 - First line start
     * @param {Object} p2 - First line end
     * @param {Object} p3 - Second line start
     * @param {Object} p4 - Second line end
     * @returns {boolean} - True if intersecting
     */
    lineSegmentsIntersect(p1, p2, p3, p4) {
        const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

        if (denominator === 0) return false;

        const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
        const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    /**
     * Calculate polyline length
     * @param {Object} polyline - Polyline entity
     * @returns {number} - Total length
     */
    calculatePolylineLength(polyline) {
        const vertices = polyline.vertices || [];
        if (vertices.length < 2) return 0;

        let totalLength = 0;
        for (let i = 0; i < vertices.length - 1; i++) {
            totalLength += this.calculateDistance(vertices[i], vertices[i + 1]);
        }

        return totalLength;
    }

    /**
     * Check if polyline has 45-degree angle
     * @param {Object} polyline - Polyline to check
     * @returns {boolean} - True if has 45-degree angle
     */
    has45DegreeAngle(polyline) {
        const vertices = polyline.vertices || [];
        if (vertices.length < 3) return false;

        for (let i = 1; i < vertices.length - 1; i++) {
            const angle = this.calculateAngle(vertices[i - 1], vertices[i], vertices[i + 1]);
            if (Math.abs(angle - 45) < 5) { // 5-degree tolerance
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate angle between three points
     * @param {Object} p1 - First point
     * @param {Object} p2 - Middle point
     * @param {Object} p3 - Third point
     * @returns {number} - Angle in degrees
     */
    calculateAngle(p1, p2, p3) {
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        const cosAngle = dot / (mag1 * mag2);
        return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
    }

    /**
     * Find intersection points between polylines
     * @param {Object} polyline1 - First polyline
     * @param {Object} polyline2 - Second polyline
     * @returns {Array} - Array of intersection points
     */
    findIntersectionPoints(polyline1, polyline2) {
        const intersections = [];
        const vertices1 = polyline1.vertices || [];
        const vertices2 = polyline2.vertices || [];

        for (let i = 0; i < vertices1.length - 1; i++) {
            const segment1Start = vertices1[i];
            const segment1End = vertices1[i + 1];

            for (let j = 0; j < vertices2.length - 1; j++) {
                const segment2Start = vertices2[j];
                const segment2End = vertices2[j + 1];

                const intersection = this.calculateLineIntersection(segment1Start, segment1End, segment2Start, segment2End);
                if (intersection) {
                    intersections.push(intersection);
                }
            }
        }

        return intersections;
    }

    /**
     * Calculate intersection point of two line segments
     * @param {Object} p1 - First line start
     * @param {Object} p2 - First line end
     * @param {Object} p3 - Second line start
     * @param {Object} p4 - Second line end
     * @returns {Object|null} - Intersection point or null
     */
    calculateLineIntersection(p1, p2, p3, p4) {
        const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

        if (Math.abs(denominator) < 1e-10) return null;

        const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;

        if (ua < 0 || ua > 1) return null;

        const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

        if (ub < 0 || ub > 1) return null;

        return {
            x: p1.x + ua * (p2.x - p1.x),
            y: p1.y + ua * (p2.y - p1.y),
            z: (p1.z || 0) + ua * ((p2.z || 0) - (p1.z || 0))
        };
    }
}

module.exports = GeometryCalculator;