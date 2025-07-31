// From SelectionSetUtil.cs
// utils/SelectionFilter.js
class SelectionFilter {
    constructor() {
        this.layerPatterns = ['GEB*'];
        this.entityTypes = ['LWPOLYLINE', 'POLYLINE', 'CIRCLE', 'INSERT'];
    }

    /**
     * Filter entities by layer patterns
     * @param {Array} entities - All entities from CAD file
     * @returns {Object} - Filtered entities by type
     */
    filterEntitiesByLayer(entities) {
        const filtered = {
            polylines: [],
            circles: [],
            blocks: [],
            other: []
        };

        for (const entity of entities) {
            if (this.matchesLayerPattern(entity.layer)) {
                this.categorizeEntity(entity, filtered);
            }
        }

        return filtered;
    }

    /**
     * Check if layer matches any pattern
     * @param {string} layerName - Layer name to check
     * @returns {boolean} - True if matches pattern
     */
    matchesLayerPattern(layerName) {
        if (!layerName) return false;

        return this.layerPatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace('*', '.*'), 'i');
                return regex.test(layerName);
            }
            return layerName.toLowerCase() === pattern.toLowerCase();
        });
    }

    /**
     * Categorize entity by type
     * @param {Object} entity - Entity to categorize
     * @param {Object} categories - Categories object
     */
    categorizeEntity(entity, categories) {
        switch (entity.type) {
            case 'LWPOLYLINE':
            case 'POLYLINE':
                categories.polylines.push(entity);
                break;
            case 'CIRCLE':
                categories.circles.push(entity);
                break;
            case 'INSERT':
                categories.blocks.push(entity);
                break;
            default:
                categories.other.push(entity);
                break;
        }
    }

    /**
     * Filter entities by shaft number
     * @param {Array} entities - Entities to filter
     * @param {string} shaftNumber - Shaft number to filter by
     * @returns {Array} - Filtered entities
     */
    filterByShaftNumber(entities, shaftNumber) {
        return entities.filter(entity => {
            const entityShaft = this.extractShaftNumber(entity.layer);
            return entityShaft === shaftNumber;
        });
    }

    /**
     * Extract shaft number from layer name
     * @param {string} layerName - Layer name
     * @returns {string} - Shaft number
     */
    extractShaftNumber(layerName) {
        const match = layerName.match(/SH-(\d+)/i);
        return match ? match[0] : '';
    }

    /**
     * Get all unique shaft numbers from entities
     * @param {Array} entities - Entities to analyze
     * @returns {Array} - Unique shaft numbers
     */
    getUniqueShaftNumbers(entities) {
        const shafts = new Set();
        
        for (const entity of entities) {
            const shaft = this.extractShaftNumber(entity.layer);
            if (shaft) {
                shafts.add(shaft);
            }
        }

        return Array.from(shafts).sort();
    }
}

module.exports = SelectionFilter;