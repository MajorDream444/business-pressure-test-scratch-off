export function googleBookingUrl(value:string|undefined){
 try {const u=new URL(value||'');return u.protocol==='https:' && !u.username && !u.password && ((u.hostname==='calendar.google.com' && u.pathname.startsWith('/calendar/appointments/')) || (u.hostname==='calendar.app.google' && u.pathname.length>1)) ? u.href : '';}
 catch{return '';}
}
