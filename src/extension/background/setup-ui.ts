import { startRecording, stopRecording } from "./recording-commands";
import { ScraperConfig } from "../../scraper/scraper-config,";

export function setupMenu(config: ScraperConfig) {
    const listeners = new Map<string, MenuActionCallback>();
  
    const menuItems: MenuItem[] = [
      { title: 'Configure', action: (info, tab) => { console.log('Configure', info, tab, info.menuItemId); } },
      { title: 'Start Recording', action: startRecording },
      { title: 'Stop Recording', action: stopRecording },
    ];
  
    menuItems.forEach(menuItem => {
      const {title, action} = menuItem;
    
      chrome.contextMenus.create({
        id: title,
        title,
        contexts: ['browser_action'],
        parentId: null
      });
    
      if (action) {
        listeners.set(title, action);
      }
    
    });
    
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      const action = listeners.get(info.menuItemId);
      if(action && tab) {
        action(info, tab, config);
      }
    });
  }
  
  export interface MenuItem {
    title: string;
    action: MenuActionCallback;
  }
  
  export type MenuActionCallback = 
    (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab, config: ScraperConfig) => void;