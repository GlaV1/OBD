// ============================================================
// ENGLISH locale file — mirrors tr.ts structure exactly
// ============================================================

import { Translations } from './tr';

const en: Translations = {
    common: {
        goBack: '← Go Back',
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        soon: 'Soon',
        unknown: 'Unknown',
        yes: 'Yes',
        no: 'No',
    },

    connection: {
        connected: 'Connected',
        disconnected: 'Disconnected',
        offline: 'Offline',
        noConnection: 'No ECU Connection',
        streaming: 'ECU Connected — Data Streaming',
        awaiting: 'Awaiting data...',
        noObd: 'No OBD connection. Connection is required to access modules.',
    },

    dashboard: {
        unknownVehicle: 'Unknown Vehicle',
        vehicleInfo: 'Vehicle Info ℹ️',
        activeModules: 'active modules',
        inDevelopment: 'in development',
        standardObd: 'Standard OBD-II',
        worksOnAll: 'Works on all vehicles',
        brandModules: 'Modules',
        brandSpecific: 'Brand Specific',
        udtProtocol: 'UDS / KWP2000 protocol',
        changeVehicle: '← Change Vehicle',
        noModules: 'Brand specific modules are not yet available for this vehicle. You can use standard OBD-II modules to read engine data and fault codes.',
    },

    settings: {
        title: 'Settings',
        subtitle: 'Application preferences and language',
        regionLanguage: 'Region & Language',
        appLanguage: 'App Language',
        appLanguageDesc: 'DTC Error definitions and interface',
        system: 'System',
        appVersion: 'App Version',
        goBack: '← Go Back',
    },

    vehicleInfo: {
        title: 'Vehicle Information',
        subtitle: 'Chassis and module data read via OBD',
        brand: 'Brand / Manufacturer',
        model: 'Model / Year',
        vin: 'Vehicle ID Number (VIN)',
        protocol: 'Protocol Family',
        unknownVehicle: 'Unknown Vehicle',
        unknownModel: 'Unknown',
        vinError: 'Could not read',
        serviceButton: 'Service Resets & Adaptations',
        serviceButtonSub: 'specific service functions',
    },

    serviceReset: {
        title: 'Service & Special Functions',
        subtitle: 'Supported functions for',
        noConnection: 'No ECU Connection. Connect to use features.',
        connectionError: 'Connection Error',
        connectionErrorDesc: 'No connection detected. Service functions require an active vehicle connection.',
        confirmTitle: 'Execute Command',
        confirmDesc: (cmd: string) => `This will send the [${cmd}] command to the ECU. Ensure the vehicle is in a safe condition. Proceed?`,
        execute: 'Execute',
        successTitle: '✅ Success',
        successDesc: (name: string) => `${name} completed successfully.`,
        goBack: '← Go Back Without Changes',
    },

    liveDataSelection: {
        title: 'Live Data Selection',
        subtitle: 'Select sensors to monitor. Max 6 selections recommended for best performance.',
        available: 'Available Parameters',
        selected: 'selected',
        showData: 'Show Data',
        cancel: 'Cancel',
    },

    liveData: {
        awaiting: 'Awaiting data...',
        noConnection: 'No connection',
    },

    faultCodes: {
        title: 'Diagnostics (DTC)',
        records: 'records',
        clearCodes: 'Clear Fault Codes',
        confirmClearTitle: 'Clear Fault Codes',
        confirmClearDesc: 'All fault codes will be cleared from ECU memory. Are you sure?',
        clearing: 'Clearing...',
        clearSuccess: '✅ Completed',
        clearSuccessDesc: 'Fault codes cleared from ECU memory.',
        systemClean: 'Vehicle Systems Clean',
        systemCleanDesc: 'No fault codes found in ECU memory.',
        unknownCode: 'Unknown',
        unknownError: 'Unknown Error',
        unknownDesc: 'This code is not in our database. Contact authorized service.',
        solution: 'Suggested Solution',
        delete: 'Clear',
    },

    freezeFrame: {
        title: 'Freeze Frame',
        subtitle: 'System sensor data recorded at the time of fault',
        loading: 'Reading from ECU memory...',
        note: 'Note: This data was frozen at the exact second the fault was triggered, and should be used as a reference to locate the source of the issue.',
    },

    readiness: {
        title: 'I/M Readiness',
        subtitle: 'System readiness status prior to emissions inspection',
        loading: 'Querying monitor status...',
        ready: 'Ready',
        incomplete: 'Incomplete',
        note: "Note: 'Incomplete' does not mean the system is faulty, but indicates the required drive cycle hasn't finished.",
    },

    modules: {
        liveData: { title: 'Live Data', desc: 'RPM, Speed, Temp, Fuel' },
        engineDtc: { title: 'Engine DTCs', desc: 'P codes — all vehicles' },
        freezeFrame: { title: 'Freeze Frame', desc: 'Data at the time of fault' },
        readiness: { title: 'Readiness Tests', desc: 'Emission system checks' },
        vwTransmission: { title: 'Transmission (02)', desc: 'VW Group ECU — UDS protocol' },
        vwAbs: { title: 'ABS / ESP (03)', desc: 'Brake system fault codes' },
        vwAirbag: { title: 'Airbag (15)', desc: 'Safety system check' },
        vwDashboard: { title: 'Dashboard (17)', desc: 'Mileage, immobilizer' },
        bmwDme: { title: 'DME / DDE Engine', desc: 'BMW engine management system' },
        bmwEgs: { title: 'EGS Transmission', desc: 'Automatic transmission module' },
        bmwAbs: { title: 'DSC / ABS', desc: 'Dynamic stability control' },
        renaultUch: { title: 'UCH / BSI', desc: 'Central electric module' },
        renaultAbs: { title: 'ABS Module', desc: 'Bosch / Continental ABS' },
        fiatEcu: { title: 'Marelli ECU', desc: 'Fiat specific engine module' },
        fiatBody: { title: 'Body Computer', desc: 'Electronic / body system' },
    },

    params: {
        RPM: 'Engine RPM',
        Speed: 'Vehicle Speed',
        EngineTemp: 'Coolant Temp',
        OilTemp: 'Oil Temp',
        TurboBoost: 'Turbo Boost',
        O2Voltage: 'O2 Sensor (B1S1)',
        BatteryVolts: 'Battery Voltage',
        FuelLevel: 'Fuel Level',
    },

    resetFunctions: {
        oilReset: { name: 'Oil Service Reset', desc: 'Standard periodic service reset' },
        vwOil: { name: 'Service Reset (UDS)', desc: 'Channel 02 Adaptation Value = 0' },
        vwThrottle: { name: 'Throttle Body Alignment', desc: 'Channel 060 / 098 Basic Settings' },
        vwEpb: { name: 'Electronic Parking Brake (EPB)', desc: 'Service mode for pad replacement' },
        bmwCbs: { name: 'CBS Service Reset', desc: 'Brake fluid, oil, vehicle check reset' },
        bmwBattery: { name: 'Battery Registration', desc: 'Registration after new battery change' },
        renaultOil: { name: 'Maintenance Interval Reset', desc: 'Dashboard maintenance light' },
        fiatOil: { name: 'Oil Degradation Reset', desc: 'Oil reset for DPF/Multijet engines' },
    },

    freezeFrameLabels: {
        calculatedLoad: 'Calculated Load',
        coolantTemp: 'Engine Coolant Temp',
        stft1: 'Short Term Fuel Trim (Bank 1)',
        ltft1: 'Long Term Fuel Trim (Bank 1)',
        map: 'Manifold Absolute Pressure',
        rpm: 'Engine RPM',
        speed: 'Vehicle Speed',
    },

    monitors: {
        misfire: 'Misfire Monitor',
        fuel: 'Fuel System',
        comp: 'Comprehensive Component',
        cat: 'Catalyst Monitor',
        htcat: 'Heated Catalyst',
        evap: 'Evaporative System',
        secair: 'Secondary Air System',
        o2: 'O2 Sensor',
        o2heat: 'O2 Sensor Heater',
        egr: 'EGR System',
    },
};

export default en;
