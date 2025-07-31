//C# code logic conversion from SelectionSetUtil.cs, MainForm.cs
const Pipe = require('../models/Pipe');
const Fitting = require('../models/Fitting');

class MaterialCalculator {
    constructor(pipeSheet) {
        this.pipeSheet = pipeSheet; // Instance of PipeSheet
    }

    processPipes(polylines) {
        // Example: group by diameter (assuming diameter is stored in entity or can be inferred)
        const pipes50 = polylines.filter(p => p.diameter === 50);
        const pipes75 = polylines.filter(p => p.diameter === 75);
        const pipes110 = polylines.filter(p => p.diameter === 110);

        // Convert to Pipe model instances
        const pipeObjs = [];
        for (const p of pipes50) {
            pipeObjs.push(Pipe.create('articleNo50', 'Pipe 50mm', 50, p.length));
        }
        for (const p of pipes75) {
            pipeObjs.push(Pipe.create('articleNo75', 'Pipe 75mm', 75, p.length));
        }
        for (const p of pipes110) {
            pipeObjs.push(Pipe.create('articleNo110', 'Pipe 110mm', 110, p.length));
        }

        return pipeObjs;
    }

    // Add similar logic for fittings, based on geometry and connections
    // Add logic for Sunken vs Under Slung if needed
}

module.exports = MaterialCalculator;