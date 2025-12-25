import { useEffect, useRef } from "react";

/**
 * Custom hook để đảm bảo effect chỉ chạy 1 lần, ngay cả khi React Strict Mode chạy 2 lần
 * @param {Function} effect - Function cần chạy
 * @param {Array} deps - Dependency array (tương tự useEffect)
 */
export function useEffectOnce(effect, deps = []) {
  const hasRunRef = useRef(false);
  const depsRef = useRef(deps);
  
  // Kiểm tra xem deps có thay đổi không
  const depsChanged = deps.length !== depsRef.current.length ||
    deps.some((dep, index) => dep !== depsRef.current[index]);
  
  // Nếu deps thay đổi, reset flag
  if (depsChanged) {
    hasRunRef.current = false;
    depsRef.current = deps;
  }
  
  useEffect(() => {
    // Nếu đã chạy rồi, bỏ qua
    if (hasRunRef.current) {
      return;
    }
    
    // Đánh dấu đã chạy
    hasRunRef.current = true;
    
    // Chạy effect
    const cleanup = effect();
    
    // Trả về cleanup function nếu có
    return cleanup;
  }, deps);
}

export default useEffectOnce;

