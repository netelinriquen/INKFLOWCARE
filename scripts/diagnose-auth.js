/**
 * Script de diagnóstico para o fluxo de autenticação do InkFlow Care
 * Executa: node scripts/diagnose-auth.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKS = [];
let hasError = false;

function check(name, passed, detail) {
  const status = passed ? '✅' : '❌';
  CHECKS.push({ name, passed, detail });
  console.log(`${status} ${name}`);
  if (detail) console.log(`   → ${detail}`);
  if (!passed) hasError = true;
}

function readFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

console.log('\n🔍 InkFlow Care — Diagnóstico de Autenticação\n');
console.log('='.repeat(55));

// 1. Verificar package.json
console.log('\n📦 1. DEPENDÊNCIAS\n');
const pkg = JSON.parse(readFile('package.json'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

check(
  'async-storage instalado',
  !!deps['@react-native-async-storage/async-storage'],
  `Versão: ${deps['@react-native-async-storage/async-storage'] || 'NÃO ENCONTRADO'}`
);

check(
  'expo-router instalado',
  !!deps['expo-router'],
  `Versão: ${deps['expo-router'] || 'NÃO ENCONTRADO'}`
);

check(
  'axios instalado',
  !!deps['axios'],
  `Versão: ${deps['axios'] || 'NÃO ENCONTRADO'}`
);

// Verificar se async-storage v3 está sendo usado
const asyncVer = deps['@react-native-async-storage/async-storage'] || '';
const isV3 = asyncVer.startsWith('^3') || asyncVer.startsWith('~3') || asyncVer.startsWith('3');
if (isV3) {
  check(
    'AsyncStorage v3 detectado',
    true,
    'v3 removeu multiGet, multiSet, multiRemove, multiMerge — usar getItem/setItem individuais'
  );
}

// Verificar se existe no node_modules
const asyncStoragePath = path.join(ROOT, 'node_modules', '@react-native-async-storage', 'async-storage');
check(
  'async-storage em node_modules',
  fs.existsSync(asyncStoragePath),
  fs.existsSync(asyncStoragePath) ? 'Encontrado' : 'NÃO encontrado — rodar npm install'
);

// 2. Verificar context/auth.tsx
console.log('\n🔐 2. CONTEXT/AUTH.TSX\n');
const authCode = readFile('context/auth.tsx');

if (!authCode) {
  check('Arquivo existe', false, 'context/auth.tsx NÃO ENCONTRADO');
} else {
  check('Arquivo existe', true);

  check(
    'NÃO usa multiRemove (removido na v3)',
    !authCode.includes('multiRemove'),
    authCode.includes('multiRemove') ? 'ERRO: multiRemove não existe no AsyncStorage v3!' : 'OK'
  );

  check(
    'NÃO usa multiSet (removido na v3)',
    !authCode.includes('multiSet'),
    authCode.includes('multiSet') ? 'ERRO: multiSet não existe no AsyncStorage v3!' : 'OK'
  );

  check(
    'NÃO usa multiGet (removido na v3)',
    !authCode.includes('multiGet'),
    authCode.includes('multiGet') ? 'ERRO: multiGet não existe no AsyncStorage v3!' : 'OK'
  );

  check(
    'Exporta AuthProvider',
    authCode.includes('export') && authCode.includes('AuthProvider'),
    ''
  );

  check(
    'Exporta useAuth',
    authCode.includes('useAuth'),
    ''
  );

  check(
    'Tem função logout',
    authCode.includes('function logout') || authCode.includes('logout'),
    ''
  );

  check(
    'logout seta logado=false',
    authCode.includes('setLogado(false)'),
    authCode.includes('setLogado(false)') ? 'OK' : 'ERRO: logout não seta logado para false!'
  );

  check(
    'NÃO faz router.replace no logout',
    !authCode.includes('router.replace'),
    authCode.includes('router.replace') ? 'AVISO: Navegação deve ser feita pelo layout, não pelo context' : 'OK — navegação delegada ao layout'
  );

  check(
    'NÃO importa expo-router',
    !authCode.includes('expo-router'),
    authCode.includes('expo-router') ? 'AVISO: auth.tsx não deveria importar expo-router' : 'OK'
  );

  // Verificar se logout está em try/catch que pode engolir erros
  const logoutMatch = authCode.match(/async function logout[\s\S]*?catch.*?\{([\s\S]*?)\}/);
  if (logoutMatch) {
    const catchBody = logoutMatch[1];
    check(
      'Catch do logout tem console.error',
      catchBody.includes('console.error') || catchBody.includes('console.log'),
      'Erros não serão silenciosos'
    );
  }
}

// 3. Verificar services/api.ts
console.log('\n🌐 3. SERVICES/API.TS\n');
const apiCode = readFile('services/api.ts');

if (!apiCode) {
  check('Arquivo existe', false, 'services/api.ts NÃO ENCONTRADO');
} else {
  check('Arquivo existe', true);

  check(
    'NÃO usa multiRemove',
    !apiCode.includes('multiRemove'),
    apiCode.includes('multiRemove') ? 'ERRO: multiRemove não existe no AsyncStorage v3!' : 'OK'
  );
}

// 4. Verificar app/_layout.tsx
console.log('\n📱 4. APP/_LAYOUT.TSX (Root Layout)\n');
const rootLayout = readFile('app/_layout.tsx');

if (!rootLayout) {
  check('Arquivo existe', false, 'app/_layout.tsx NÃO ENCONTRADO');
} else {
  check('Arquivo existe', true);

  check(
    'Usa AuthProvider',
    rootLayout.includes('<AuthProvider'),
    ''
  );

  check(
    'NÃO tem Guard component',
    !rootLayout.includes('function Guard'),
    rootLayout.includes('function Guard') ? 'AVISO: Guard no root layout pode causar problemas com Redirect' : 'OK — proteção delegada às telas'
  );

  check(
    'NÃO usa useEffect para navegação',
    !rootLayout.includes('useEffect'),
    rootLayout.includes('useEffect') ? 'AVISO: useEffect + router.replace é instável no Expo Router' : 'OK'
  );

  check(
    'Stack tem initialRouteName=login',
    rootLayout.includes('initialRouteName') && rootLayout.includes('login'),
    ''
  );
}

// 5. Verificar app/(tabs)/_layout.tsx
console.log('\n📑 5. APP/(TABS)/_LAYOUT.TSX\n');
const tabsLayout = readFile('app/(tabs)/_layout.tsx');

if (!tabsLayout) {
  check('Arquivo existe', false, 'app/(tabs)/_layout.tsx NÃO ENCONTRADO');
} else {
  check('Arquivo existe', true);

  check(
    'Importa useAuth',
    tabsLayout.includes('useAuth'),
    tabsLayout.includes('useAuth') ? 'OK' : 'ERRO: Tabs não verifica autenticação!'
  );

  check(
    'Importa Redirect',
    tabsLayout.includes('Redirect'),
    tabsLayout.includes('Redirect') ? 'OK' : 'ERRO: Precisa de Redirect para redirecionar ao login'
  );

  check(
    'Verifica logado antes de renderizar tabs',
    tabsLayout.includes('!logado') || tabsLayout.includes('logado === false'),
    ''
  );

  check(
    'Retorna Redirect quando não logado',
    tabsLayout.includes('Redirect') && tabsLayout.includes('/login'),
    ''
  );

  check(
    'Verifica loading state',
    tabsLayout.includes('loading'),
    tabsLayout.includes('loading') ? 'OK' : 'AVISO: Pode redirecionar antes de verificar AsyncStorage'
  );
}

// 6. Verificar login.tsx
console.log('\n🔑 6. APP/LOGIN.TSX\n');
const loginCode = readFile('app/login.tsx');

if (!loginCode) {
  check('Arquivo existe', false, 'app/login.tsx NÃO ENCONTRADO');
} else {
  check('Arquivo existe', true);

  check(
    'Importa useAuth',
    loginCode.includes('useAuth'),
    ''
  );

  check(
    'Verifica se já está logado',
    loginCode.includes('logado') && loginCode.includes('Redirect'),
    loginCode.includes('logado') ? 'OK — redireciona para tabs se já logado' : 'AVISO: Login não verifica se já está logado'
  );
}

// 7. Verificar perfil.tsx
console.log('\n👤 7. APP/(TABS)/PERFIL.TSX\n');
const perfilCode = readFile('app/(tabs)/perfil.tsx');

if (!perfilCode) {
  check('Arquivo existe', false, 'app/(tabs)/perfil.tsx NÃO ENCONTRADO');
} else {
  check('Arquivo existe', true);

  check(
    'Chama logout()',
    perfilCode.includes('logout()') || perfilCode.includes('logout('),
    ''
  );

  check(
    'Logout está dentro de Alert.alert',
    perfilCode.includes('Alert.alert') && perfilCode.includes('logout'),
    'Verificar se o onPress do Alert realmente chama logout'
  );

  // Check if logout is awaited
  check(
    'Logout é awaited',
    perfilCode.includes('await logout()'),
    perfilCode.includes('await logout()') ? 'OK' : 'AVISO: logout() é async, precisa de await'
  );
}

// 8. Verificar expo config
console.log('\n⚙️  8. CONFIGURAÇÃO EXPO\n');
const appJson = readFile('app.json');
if (appJson) {
  const config = JSON.parse(appJson);
  check(
    'app.json existe',
    true,
    `Scheme: ${config.expo?.scheme || 'N/A'}`
  );
}

// 9. Resumo
console.log('\n' + '='.repeat(55));
const passed = CHECKS.filter(c => c.passed).length;
const failed = CHECKS.filter(c => !c.passed).length;
console.log(`\n📊 RESULTADO: ${passed} passou, ${failed} falhou\n`);

if (hasError) {
  console.log('❌ PROBLEMAS ENCONTRADOS! Corrija os itens marcados com ❌ acima.\n');
} else {
  console.log('✅ Nenhum problema estrutural encontrado.\n');
  console.log('🔍 Se o logout AINDA não funciona, os problemas possíveis são:\n');
  console.log('   1. Cache do Metro Bundler — rodar: npx expo start --clear');
  console.log('   2. App precisa ser reiniciado no dispositivo (fechar e abrir)');
  console.log('   3. O Redirect do Expo Router pode não reagir a mudanças de estado');
  console.log('      → Solução: usar router.replace DENTRO do (tabs)/_layout.tsx');
  console.log('   4. Verifique o console/terminal do Expo para erros\n');
}
