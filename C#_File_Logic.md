# ==============================
# GEB MATERIAL EXTRACTOR APP
# ==============================

## WHAT THIS APP DOES (SIMPLE EXPLANATION)

This is a **MATERIAL EXTRACTION TOOL** that:
1. Takes CAD drawings (DXF/DWG files) of plumbing systems  
2. Finds all the pipes, fittings, and materials in the drawing  
3. Calculates how much material you need (pipes, bends, couplings, etc.)  
4. Generates an Excel report with a shopping list of materials  

Think of it like a **SMART CALCULATOR** that reads a plumbing blueprint and tells you exactly what to buy.

---

## HOW IT WORKS (STEP BY STEP)

### STEP 1: Upload CAD File
- Upload DXF/DWG file  
- App reads the file and finds plumbing elements  

### STEP 2: Filter by Layer
- Filters only layers starting with `"GEB"`  
- Ignores furniture, walls, etc.  

### STEP 3: Identify Materials
- **Pipes**: Long lines  
- **Fittings**: Circles and special blocks  
- **Shafts**: Groups by `SH-01`, `SH-02`, etc.  

### STEP 4: Calculate Quantities
- Measures pipe lengths  
- Counts fittings  
- Groups by material type and shaft  

### STEP 5: Generate Report
- Creates Excel with material list  
- Shows quantities per shaft  
- Includes article numbers and descriptions  

---

## PURPOSE OF EACH FILE

### MODELS (DATA CONTAINERS)

#### 1. `SanitaryMaterial.js`
- Stores info about each material  
- Article number, description, quantity, shaft, unit  

#### 2. `PipeSheet.js`
- Config for different pipe types  
- Sunken/Under Slung, diameters for WC, washbasin, etc.  

#### 3. `Pipe.js` & `Fitting.js`
- Pipe: length, diameter, connection points  
- Fitting: type (bend, coupling), angle, connections  

---

### SERVICES (BUSINESS LOGIC)

#### 1. `CADProcessor.js`
- Reads CAD files  
- Extracts lines, circles, blocks  
- Filters by GEB layers  

#### 2. `MaterialCalculator.js`
- Groups pipes by diameter  
- Calculates lengths and fitting counts  

#### 3. `ExcelGenerator.js`
- Builds Excel report  
- Adds headers, totals, formatting  

#### 4. `SelectionSetUtil.js`
- Groups by shaft  
- Finds pipe/fitting connections  
- Handles special logic  

---

### COLLECTIONS (MATERIAL DATABASE)

#### `SanitaryObjectsCollections.js`
- Material lists for WC, urinals, washbasins  
- Article numbers and descriptions  
- Like a product catalog  

---

### UTILS (HELPER FUNCTIONS)

#### 1. `GeometryCalculator.js`
- Distance, length, intersection math  
- Detects angles and connections  

#### 2. `ValidationUtils.js`
- Validates input and material data  
- Checks required fields  

#### 3. `SelectionFilter.js`
- Finds GEB layers  
- Extracts shafts  
- Categorizes elements  

#### 4. `BlockProcessor.js`
- Detects and processes fitting blocks  
- Estimates diameters and IDs  

---

### ROUTES (API ENDPOINTS)

#### `api.js`
- `/api/process-cad` → Upload CAD file  
- `/api/calculate-materials` → Calculate quantities  
- `/api/export-excel` → Download Excel  
- `/api/materials` → Get results  

---

### MAIN SERVER

#### `server.js`
- Runs the app  
- Handles uploads  
- Manages security  
- Connects all modules  

---

## REAL-WORLD WORKFLOW EXAMPLE

1. Architect makes plumbing drawing  
2. Drawing has layers: GEB-SH-01, SH-02, etc.  
3. User uploads DXF file  
4. App processes:  
   - Finds GEB pipes  
   - Measures length  
   - Finds fittings  
   - Groups by shaft  
5. App calculates:  
   - 50mm pipes: 25m  
   - 110mm pipes: 15m  
   - Bends: 8 pieces  
   - Couplings: 12 pieces  
6. App generates Excel:  
   - Grouped by type and shaft  
   - Includes article numbers  
7. User downloads and uses to order  

---

