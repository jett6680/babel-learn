/**
 * say 你好
 * @param name 名字
 * @param age 年龄
 * @param children 是否小孩子
 */
function sayHi(name: string, age: number, children: boolean) {
  console.log(`hi, ${name}`);
  return `hi, ${name}`;
}

function getSum(a: number, b: number): number {
  return a + b
}

/**
* 类测试
*/
class Person {
  name: string; // name 属性
  constructor(name: string) {
    this.name = name;
  }
  /**
   * 方法测试
   */
  sayHi(): string {
    return `hi, I'm ${this.name}`;
  }

  /**
   * @param speed 跑的速度
   */
  run(speed: number): void {
    console.log(`这个人能跑的速度是 ${ speed }`)
  }
}