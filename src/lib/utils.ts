export function createRandomId(prefix = "modal", length = 9) {
  const randomArr = new Uint8Array(length);
  crypto.getRandomValues(randomArr);

  // base36처럼 영문+숫자 조합 문자열 생성
  const randomStr = Array.from(randomArr, (n) => (n % 36).toString(36)).join(
    ""
  );

  return `${prefix}-${Date.now()}-${randomStr}`;
}
