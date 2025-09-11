// // src/test-connection.ts
// import { supabase } from './supabase/supabase.client';

// async function testConnection() {
//   // Wykonujemy proste zapytanie SELECT z tabeli orders
//   const { data, error } = await supabase
//     .from('orders')
//     .select('*');
  
//   if (error) {
//     console.error('Błąd podczas łączenia z Supabase:', error);
//   } else {
//     console.log('Połączenie z Supabase działa. Otrzymane dane:', data);
//   }
// }

// testConnection().then(() => process.exit(0));
