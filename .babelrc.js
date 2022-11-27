module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: 'chrome 30',
                debug: true,
                useBuiltIns: 'usage',
                corejs: 3
            }
        ]
    ],
    plugins: [
        [
            '@babel/plugin-transform-runtime',
            {
                corejs: 3
            }
        ]
    ]
}