//C# code logic conversion from SelectionSetUtil.cs

class SelectionSetUtil {
    // Group entities by shaft number (assuming shaft number is a property or can be inferred)
    groupByShaft(entities) {
        const grouped = {};
        for (const entity of entities) {
            const shaft = entity.shaftNumber || 'UNKNOWN';
            if (!grouped[shaft]) grouped[shaft] = [];
            grouped[shaft].push(entity);
        }
        return grouped;
    }

    // Example: check if two polylines intersect (simplified)
    static polylinesIntersect(poly1, poly2) {
        // Implement intersection logic or use a geometry library
        // For now, just a stub
        return false;
    }

    // Calculate total material quantities per shaft
    calculateQuantitiesByShaft(materials) {
        const result = {};
        for (const mat of materials) {
            if (!result[mat.shaftNumber]) result[mat.shaftNumber] = 0;
            result[mat.shaftNumber] += mat.quantity;
        }
        return result;
    }
}

module.exports = SelectionSetUtil;