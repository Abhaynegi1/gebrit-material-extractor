//C# code logic conversion from ObjectsCollections/SanitaryObjectsCollections.cs
class SanitaryObjectsCollections {
    // Returns an array of wash basin/sink materials
    getWashBasinCollection() {
        return [
            "152.682.00.1|PC|sleeve EPDM for d50 50IRHD",
            "152.796.00.1|PC|sleeve EPDM for d50 60IRHD",
            "152.742.11.1|PC|drain assembly for cast iron 1 1/2''x40",
            "361.802.92.1|PC|protective cap for pipe end PE-HD d50",
            "361.000.16.0|M|pipe PE-HD d50x3 L5000",
            "361.000.16.0|M|pipe PE-HD d50x3 L5000",
            "361.045.16.1|PC|bend PE-HD 45G d50 L4.5",
            "361.088.16.1|PC|bend PE-HD 88.5G d50 L6",
            "361.112.16.1|PC|Geberit HDPE Y-branch fitting 45°, dia.50/50",
            "361.162.16.1|PC|branch fitting PE-HD 88.5G d50/50",
            "367.560.16.1|PC|reducer PE-HD d110/50 concentric",
            "361.771.16.1|PC|electrofusion sleeve coupling PE-HD d50"
        ];
    }

    // Returns an array of urinal materials
    getUrinalsCollection() {
        return [
            "152.689.00.1|PC|sleeve EPDM for d56 50IRHD",
            "363.000.16.0|M|pipe PE-HD d56x3 L500",
            "363.000.16.0|M|pipe PE-HD d56x3 L500",
            "363.045.16.1|PC|bend PE-HD 45G d56 L4.5",
            "363.088.16.1|PC|bend PE-HD 88.5G d56 L6.5",
            "363.115.16.1|PC|branch fitting PE-HD 45G d56/56",
            "363.165.16.1|PC|branch fitting PE-HD 88.5G d56/56",
            "363.771.16.1|PC|electrofusion sleeve coupling PE-HD d56"
        ];
    }

    // ... Add other collections as needed (ShowerFloorDrain, BathTub, WaterCloset, etc.)

    // Checks if a searchText (articleNo) exists in a collection (array of strings)
    checkFromCollection(collection, searchText) {
        return collection.some(item => item.startsWith(searchText + '|'));
    }

    // Gets the description for a given article number from all collections
    getDescriptionByArticleNumber(articleNo) {
        // Combine all collections into one array
        const allCollections = [
            ...this.getWashBasinCollection(),
            ...this.getUrinalsCollection(),
            // ...add other collections here
        ];

        // Find the item that starts with the article number
        const found = allCollections.find(item => item.startsWith(articleNo + '|'));
        if (found) {
            // The format is "articleNo|unit|description"
            const parts = found.split('|');
            return parts.length >= 3 ? parts[2] : '';
        }
        return '';
    }
}

module.exports = SanitaryObjectsCollections;