# GEB Material Extractor API

A Node.js API for extracting material quantities from CAD files (DXF/DWG) for sanitary engineering projects.

## How the Extraction Works

### 1. **File Upload & Processing**
- Accepts DXF/DWG files via POST `/api/process-cad`
- Validates file format and size (max 50MB)
- Parses CAD entities using `dxf-parser` library
- Extracts polylines (pipes), circles (fittings), and blocks (complex fittings)

### 2. **Entity Processing Pipeline**
```
CAD File → Parse DXF → Filter Entities → Enrich Data → Calculate Materials → Export Excel
```

### 3. **Material Calculation**
- Processes polylines as pipes with length calculations
- Identifies circles as fittings (elbows, tees, couplings)
- Analyzes blocks as complex fittings (valves, pumps, tanks)
- Groups materials by shaft numbers extracted from layer names

### 4. **Excel Export**
- Generates detailed material lists with quantities
- Creates multi-sheet reports with calculations
- Supports shaft-based organization

## File Structure & Roles

### **Core API Files**

#### `server.js`
- **Role**: Main application entry point
- **Responsibilities**:
  - Express server setup and configuration
  - CORS and security middleware
  - Health check endpoint (`/health`)
  - Global error handling
  - Static file serving for uploads

#### `routes/api.js`
- **Role**: API route definitions and request handling
- **Endpoints**:
  - `POST /api/process-cad` - Upload and process CAD files
  - `POST /api/calculate-materials` - Calculate material quantities
  - `POST /api/export-excel` - Generate Excel reports
  - `GET /api/materials` - Retrieve processed materials
  - `GET /api/entities` - Get processed CAD entities
  - `DELETE /api/materials` - Clear processed data

### **Services Layer**

#### `services/CADProcessor.js`
- **Role**: Core CAD file processing engine
- **Responsibilities**:
  - Parse DXF files using `dxf-parser`
  - Extract and filter CAD entities (polylines, circles, blocks)
  - Enrich entities with additional properties (diameter, type, shaft)
  - Handle DWG to DXF conversion (placeholder)
  - Geometry calculations for pipes and fittings

#### `services/MaterialCalculator.js`
- **Role**: Material quantity calculations and processing
- **Responsibilities**:
  - Convert processed entities to material objects
  - Calculate pipe lengths and fitting quantities
  - Apply material specifications and standards
  - Generate material lists with article numbers

#### `services/ExcelGenerator.js`
- **Role**: Excel report generation
- **Responsibilities**:
  - Create Excel files with material data
  - Generate multi-sheet reports
  - Format data for different report types
  - Handle file downloads and saving

#### `services/SelectionSetUtil.js`
- **Role**: Entity grouping and organization utilities
- **Responsibilities**:
  - Group materials by shaft numbers
  - Calculate quantities per shaft
  - Organize data for reporting
  - Handle selection set operations

### **Models Layer**

#### `models/PipeSheet.js`
- **Role**: Data model for pipe sheet configurations
- **Responsibilities**:
  - Define pipe sheet properties (thickness, material)
  - Validate pipe sheet configurations
  - Handle pipe sheet data transformations

#### `models/Pipe.js`
- **Role**: Data model for pipe entities
- **Responsibilities**:
  - Define pipe properties (length, diameter, type)
  - Handle pipe geometry calculations
  - Validate pipe data

#### `models/Fitting.js`
- **Role**: Data model for fitting entities
- **Responsibilities**:
  - Define fitting properties (type, diameter, quantity)
  - Handle fitting classifications
  - Validate fitting data

#### `models/SanitaryMaterial.js`
- **Role**: Data model for sanitary materials
- **Responsibilities**:
  - Define material properties (article number, description, unit)
  - Handle material specifications
  - Validate material data

### **Utilities Layer**

#### `utils/GeometryCalculator.js`
- **Role**: Geometric calculations for CAD entities
- **Responsibilities**:
  - Calculate polyline lengths
  - Detect 45-degree angles
  - Measure distances between points
  - Handle complex geometry operations

#### `utils/SelectionFilter.js`
- **Role**: Filter and categorize CAD entities
- **Responsibilities**:
  - Filter entities by layer patterns (GEB* layers)
  - Extract shaft numbers from layer names
  - Categorize entities by type
  - Apply selection criteria

#### `utils/BlockProcessor.js`
- **Role**: Process complex block entities
- **Responsibilities**:
  - Handle INSERT entities (blocks)
  - Process block fittings (valves, pumps, tanks)
  - Extract block properties and metadata
  - Classify block types

#### `utils/ValidationUtils.js`
- **Role**: Input validation and data integrity
- **Responsibilities**:
  - Validate API input parameters
  - Check data format and completeness
  - Ensure data consistency
  - Provide validation error messages

#### `utils/GeometryUtils.js`
- **Role**: Additional geometry utilities
- **Responsibilities**:
  - Coordinate transformations
  - Geometric calculations
  - Spatial analysis
  - Geometry validation

### **Collections**

#### `collections/SanitaryObjectsCollections.js`
- **Role**: Predefined material collections and standards
- **Responsibilities**:
  - Define standard material specifications
  - Provide material catalogs
  - Handle material classifications
  - Store industry standards

## API Workflow

### 1. **Upload Phase**
```
Client → POST /api/process-cad → CADProcessor → Parse DXF → Store Entities
```

### 2. **Calculation Phase**
```
Client → POST /api/calculate-materials → MaterialCalculator → Process Entities → Generate Materials
```

### 3. **Export Phase**
```
Client → POST /api/export-excel → ExcelGenerator → Create Report → Download File
```

## Key Features

- **Multi-format Support**: DXF and DWG files
- **Intelligent Parsing**: Automatic entity classification
- **Shaft-based Organization**: Materials grouped by shaft numbers
- **Excel Export**: Detailed reports with calculations
- **Error Handling**: Comprehensive error management
- **Validation**: Input and data validation at multiple levels

## Technology Stack

- **Runtime**: Node.js with Express
- **CAD Parsing**: dxf-parser library
- **File Handling**: multer for uploads, fs-extra for file operations
- **Excel Generation**: ExcelJS library
- **Security**: helmet, cors middleware
- **Validation**: Custom validation utilities

## Usage Example

```bash
# Start the server
npm start

# Test with Postman
POST http://localhost:3000/api/process-cad
Body: form-data with cadFile field
```

The API processes CAD files, extracts material quantities, and generates comprehensive Excel reports for sanitary engineering projects.