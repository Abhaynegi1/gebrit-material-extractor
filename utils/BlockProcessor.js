// From SelectionSetUtil.cs
class BlockProcessor {
    constructor() {
        this.blockDefinitions = new Map();
        this.fittingTypes = {
            'BEND': 'bend',
            'BRANCH': 'branch',
            'COUPLING': 'coupling',
            'REDUCER': 'reducer',
            'TEE': 'tee',
            'ELBOW': 'elbow'
        };
    }

    /**
     * Process block references from CAD file
     * @param {Array} blocks - Block entities
     * @returns {Array} - Processed block fittings
     */
    processBlockFittings(blocks) {
        const fittings = [];

        for (const block of blocks) {
            const fitting = this.processBlock(block);
            if (fitting) {
                fittings.push(fitting);
            }
        }

        return fittings;
    }

    /**
     * Process individual block
     * @param {Object} block - Block entity
     * @returns {Object|null} - Processed fitting or null
     */
    processBlock(block) {
        const blockName = block.blockName || '';
        const fittingType = this.determineFittingType(blockName);
        
        if (!fittingType) return null;

        return {
            type: 'block',
            blockName: blockName,
            fittingType: fittingType,
            insertionPoint: block.insertionPoint,
            scale: block.scale || { x: 1, y: 1, z: 1 },
            rotation: block.rotation || 0,
            layer: block.layer,
            shaftNumber: this.extractShaftNumber(block.layer),
            diameter: this.estimateBlockDiameter(blockName),
            articleNo: this.getArticleNumber(blockName, fittingType),
            description: this.getDescription(blockName, fittingType)
        };
    }

    /**
     * Determine fitting type from block name
     * @param {string} blockName - Block name
     * @returns {string|null} - Fitting type
     */
    determineFittingType(blockName) {
        const upperName = blockName.toUpperCase();
        
        for (const [key, value] of Object.entries(this.fittingTypes)) {
            if (upperName.includes(key)) {
                return value;
            }
        }

        // Additional logic for specific block patterns
        if (upperName.includes('45') || upperName.includes('ANGLE')) {
            return 'bend';
        }
        if (upperName.includes('Y') || upperName.includes('TEE')) {
            return 'branch';
        }
        if (upperName.includes('COUPLE') || upperName.includes('JOINT')) {
            return 'coupling';
        }

        return null;
    }

    /**
     * Estimate block diameter from block name
     * @param {string} blockName - Block name
     * @returns {number} - Estimated diameter
     */
    estimateBlockDiameter(blockName) {
        const upperName = blockName.toUpperCase();
        
        // Look for diameter indicators in block name
        const diameterMatch = upperName.match(/D(\d+)/);
        if (diameterMatch) {
            return parseInt(diameterMatch[1]);
        }

        // Fallback based on block name patterns
        if (upperName.includes('50') || upperName.includes('DN50')) return 50;
        if (upperName.includes('75') || upperName.includes('DN75')) return 75;
        if (upperName.includes('110') || upperName.includes('DN110')) return 110;

        return 50; // Default diameter
    }

    /**
     * Get article number for block
     * @param {string} blockName - Block name
     * @param {string} fittingType - Fitting type
     * @returns {string} - Article number
     */
    getArticleNumber(blockName, fittingType) {
        // This would be mapped to your material database
        const articleMap = {
            'bend': {
                '50': '361.045.16.1',
                '75': '365.045.16.1',
                '110': '367.045.16.1'
            },
            'branch': {
                '50': '361.112.16.1',
                '75': '365.115.16.1',
                '110': '367.115.16.1'
            },
            'coupling': {
                '50': '361.771.16.1',
                '75': '365.771.16.1',
                '110': '367.771.16.1'
            }
        };

        const diameter = this.estimateBlockDiameter(blockName);
        return articleMap[fittingType]?.[diameter] || '';
    }

    /**
     * Get description for block
     * @param {string} blockName - Block name
     * @param {string} fittingType - Fitting type
     * @returns {string} - Description
     */
    getDescription(blockName, fittingType) {
        const diameter = this.estimateBlockDiameter(blockName);
        
        const descriptions = {
            'bend': `bend PE-HD 45G d${diameter}`,
            'branch': `branch fitting PE-HD 45G d${diameter}`,
            'coupling': `electrofusion sleeve coupling PE-HD d${diameter}`,
            'reducer': `reducer PE-HD d${diameter}`,
            'tee': `tee fitting PE-HD d${diameter}`,
            'elbow': `elbow PE-HD 90G d${diameter}`
        };

        return descriptions[fittingType] || `${fittingType} d${diameter}`;
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
     * Check if block is connected to other entities
     * @param {Object} block - Block entity
     * @param {Array} polylines - Polyline entities
     * @param {number} tolerance - Connection tolerance
     * @returns {Array} - Connected polylines
     */
    findConnectedPolylines(block, polylines, tolerance = 0.5) {
        const connected = [];
        const insertionPoint = block.insertionPoint;

        for (const polyline of polylines) {
            const vertices = polyline.vertices || [];
            
            for (const vertex of vertices) {
                const distance = Math.sqrt(
                    Math.pow(vertex.x - insertionPoint.x, 2) +
                    Math.pow(vertex.y - insertionPoint.y, 2)
                );
                
                if (distance <= tolerance) {
                    connected.push(polyline);
                    break;
                }
            }
        }

        return connected;
    }

    /**
     * Validate block configuration
     * @param {Object} block - Block entity
     * @returns {Object} - Validation result
     */
    validateBlock(block) {
        const errors = [];

        if (!block.blockName) {
            errors.push('Block name is required');
        }

        if (!block.insertionPoint) {
            errors.push('Insertion point is required');
        }

        if (!block.layer) {
            errors.push('Layer is required');
        }

        const fittingType = this.determineFittingType(block.blockName);
        if (!fittingType) {
            errors.push(`Unknown fitting type for block: ${block.blockName}`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = BlockProcessor;