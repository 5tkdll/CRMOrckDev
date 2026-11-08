import type {Metadata} from "next";
import {ThemeToggle} from "@/components/theme/theme-toggle";
import {ThemeStyles} from "@/components/theme/theme-styles";
import "./globals.css";
import "@/components/theme/theme.css";
export const metadata:Metadata={title:"CRM ORCK DEV",description:"CRM interno da ORCK DEV"};
const themeBootstrap="(function(){try{var p=null;try{p=localStorage.getItem(\"crm-orck-theme\")}catch(e){}var d=typeof matchMedia===\"function\"&&matchMedia(\"(prefers-color-scheme: dark)\").matches;var t=p===\"light\"||p===\"dark\"?p:d?\"dark\":\"light\";document.documentElement.setAttribute(\"data-crm-theme\",t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.setAttribute(\"data-crm-theme\",\"light\")}})();";
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR" data-crm-theme="light" suppressHydrationWarning><head><script id="crm-theme-bootstrap" dangerouslySetInnerHTML={{__html:themeBootstrap}}/><ThemeStyles/></head><body>{children}<ThemeToggle/></body></html>;}
