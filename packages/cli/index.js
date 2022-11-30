#!/usr/bin/env node

const { Command } = require('commander')
const glob = require('glob')
const { cosmiconfigSync } = require('cosmiconfig')

const command = new Command()

command.name('@babel/babel-cli')
  .description('CLI to JavaScript parser')
  .version('1.0.0')

command
  .option('--watch', '是否观测文件修改')
  .option('--out-dir <char>', '输出结果目录')

command.parse();

const cliOps = command.opts()

const inputs = command.args[0]
if (!inputs) {
  command.outputHelp()
  process.exit(1)
}

if (!cliOps.outDir) {
  command.outputHelp()
  process.exit(1)
}

// eg: node index.js ../parser/**.js --out-dir=dist
const filenames = glob.sync(command.args[0]);

// 查找配置文件
const explorerSync = cosmiconfigSync('myBabel');
const searchResult = explorerSync.search();

// 找到了配置文件和参数,接下来可以进行babel parser 等操作
console.log(searchResult)
console.log('111', cliOps, command.args, filenames)