module.exports = {
    // globals: {
    //     Uint8Array: Uint8Array,
    //     "ts-jest": {
    //         "tsconfig": {
    //             "allowJs": true
    //         }
    //     }
    // },
    // extensionsToTreatAsEsm: [".ts"],
    // "transform": {
    //     "node_modules/@polkadot/.+\\.(j|t)sx?$": "ts-jest"
    // },
    // transformIgnorePatterns: [
    //     "/node_modules/(?!@polkadot)/"
    // ],
    // preset: 'ts-jest'
    preset: 'ts-jest',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: [".ts"],
    "transform": {
        "^.+\\.[tj]sx?$": "ts-jest"
    },
    "transformIgnorePatterns": [
        "<rootDir>/node_modules/(?!@polkadot|@babel)",
    ],
    "globals": {
        Uint8Array: Uint8Array,
        "ts-jest": {
            "tsconfig": '<rootDir>/tsconfig.json'
        }
    },
};