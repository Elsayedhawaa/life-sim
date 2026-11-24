const paths={
phone:'<rect x="18" y="7" width="28" height="50" rx="5"/><path d="M28 12h8M29 51h6"/><rect x="23" y="18" width="18" height="26" rx="2" fill="currentColor" opacity=".12" stroke="none"/>',
audio:'<path d="M13 35v-8a19 19 0 0 1 38 0v8"/><rect x="9" y="28" width="11" height="24" rx="5"/><rect x="44" y="28" width="11" height="24" rx="5"/>',
watch:'<path d="M24 18l2-13h12l2 13M24 46l2 13h12l2-13"/><circle cx="32" cy="32" r="16"/><path d="M32 22v11l7 4M48 28h4v8h-4"/>',
laptop:'<rect x="11" y="12" width="42" height="31" rx="3"/><path d="M6 45h52l-5 7H11zM27 48h10"/>',
fashion:'<path d="M23 10l9 5 9-5 15 13-10 11-5-5v27H23V29l-5 5L8 23z"/>',
luxury:'<rect x="10" y="24" width="44" height="31" rx="5"/><path d="M23 24v-7a9 9 0 0 1 18 0v7M10 36h44M29 33h6v7h-6"/>',
jewelry:'<path d="M12 20l9-12h22l9 12-20 34zM12 20h40M21 8l11 46L43 8M21 8l11 12L43 8"/>',
furniture:'<path d="M15 34V20a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v14M10 32h7v12h30V32h7v20H10zM16 52v6M48 52v6"/>',
appliances:'<rect x="12" y="6" width="40" height="52" rx="4"/><circle cx="32" cy="36" r="14"/><path d="M18 15h4M28 15h4M40 15h6M21 36c7-8 15 8 22 0"/>',
essentials:'<path d="M15 19h34l5 38H10zM23 22V15a9 9 0 0 1 18 0v7"/>',
electronics:'<rect x="9" y="17" width="46" height="33" rx="5"/><circle cx="32" cy="34" r="11"/><path d="M18 17l5-7h18l5 7M45 24h3"/>',
tv:'<rect x="6" y="11" width="52" height="36" rx="3"/><path d="M24 55h16M32 47v8"/>',
gold:'<path d="M17 15h30l11 37H6zM17 15l5 24h20l5-24M6 52l16-13M58 52L42 39"/>'};
export function shopCategoryIcon(category,size=48){const aliases={tablet:'phone',desktop:'laptop',appliance:'appliances'};return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${paths[aliases[category]||category]||paths.essentials}</svg>`;}
