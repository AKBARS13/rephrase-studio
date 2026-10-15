import{useEffect,useState}from"react";import type{UserSettings}from"../types";
export const SETTINGS_KEY="rephrase-studio-settings-v1";
export const DEFAULT_SETTINGS:UserSettings={interfaceLanguage:"id",defaultLanguage:"auto",defaultStyle:"academic",defaultIntensity:"medium",historyEnabled:false,saveSourceText:true,persistDraft:false};
export function useUserSettings(){const[settings,setSettings]=useState<UserSettings>(()=>{try{return{...DEFAULT_SETTINGS,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")}}catch{return DEFAULT_SETTINGS}});useEffect(()=>{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));document.documentElement.lang=settings.interfaceLanguage},[settings]);return[settings,setSettings]as const}
