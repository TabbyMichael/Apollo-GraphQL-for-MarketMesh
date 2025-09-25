console.log('Simple test script started!');
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Test async/await
async function testAsync() {
  console.log('Testing async/await...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Async/await works!');
  return 'Success';
}

testAsync()
  .then(result => console.log('Test result:', result))
  .catch(error => console.error('Test error:', error))
  .finally(() => console.log('Test completed!'));
