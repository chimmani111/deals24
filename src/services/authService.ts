
const isAuthenticated = () => {
  return localStorage.getItem('adminAuth') === '____________';
};

const login = (username: string, password: string): boolean => {
  if (
    username === import.meta.env.VITE_ADMIN_USERNAME && 
    password === import.meta.env.VITE_ADMIN_PASSWORD
  ) {
    localStorage.setItem('adminAuth', '____________');
    return true;
  }
  return false;
};

const logout = () => {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('editPermissionGranted');
  localStorage.removeItem('categoryPermissionGranted');
};

const hasEditPermission = (): boolean => {
  return localStorage.getItem('editPermissionGranted') === 'true';
};

const hasCategoryPermission = (): boolean => {
  return localStorage.getItem('categoryPermissionGranted') === 'true';
};

const grantEditPermission = (): void => {
  localStorage.setItem('editPermissionGranted', 'true');
};

const grantCategoryPermission = (): void => {
  localStorage.setItem('categoryPermissionGranted', 'true');
};

const verifyActionPassword = (password: string): boolean => {
  const correctPassword = import.meta.env.VITE_DELETE_PASSWORD || 'admin123';
  return password === correctPassword;
};

export { 
  isAuthenticated, 
  login, 
  logout, 
  hasEditPermission, 
  hasCategoryPermission, 
  grantEditPermission, 
  grantCategoryPermission, 
  verifyActionPassword 
};
