'use client'

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// Remove potentially problematic type import
// import { type ThemeProviderProps } from "next-themes/dist/types"

// Let TypeScript infer the props from the component itself
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 