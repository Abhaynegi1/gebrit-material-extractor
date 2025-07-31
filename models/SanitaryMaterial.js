//Logic conversion from C# file SanitaryMaterial.cs

class SanitaryMaterial {
    constructor() {
        this.shaftNumber = '';
        this.articleNo = '';
        this.description = '';
        this.source = '';
        this.type = '';
        this.length = 0;
        this.diameter = 0;
        this.unitType = '';
        this.quantity = 0;
        this.layer = '';
    }

    // Helper method to create a new instance
    static create(data = {}) {
        const material = new SanitaryMaterial();
        Object.assign(material, data);
        return material;
    }

    // Method to validate the material
    isValid() {
        return this.articleNo && this.description && this.quantity > 0;
    }

    // Method to get display string
    toString() {
        return `${this.articleNo} - ${this.description} (Qty: ${this.quantity} ${this.unitType})`;
    }

    // Method to clone the material
    clone() {
        return SanitaryMaterial.create({
            shaftNumber: this.shaftNumber,
            articleNo: this.articleNo,
            description: this.description,
            source: this.source,
            type: this.type,
            length: this.length,
            diameter: this.diameter,
            unitType: this.unitType,
            quantity: this.quantity,
            layer: this.layer
        });
    }

    // Method to update quantity
    updateQuantity(newQuantity) {
        this.quantity = newQuantity;
        return this;
    }

    // Method to add quantity
    addQuantity(additionalQuantity) {
        this.quantity += additionalQuantity;
        return this;
    }
}

module.exports = SanitaryMaterial;