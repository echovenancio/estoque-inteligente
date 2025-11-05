import React from 'react';
import { Redirect } from 'expo-router';

export default function Page() {
  // Redirect root to the login route
  return <Redirect href="/login" />;
}
