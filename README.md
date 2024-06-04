# leblet

Dette er noe simple hjemmemekka greier til en tablet jeg har hengt opp i
gangen med dobbeltsidig teip. Legges her fordi en kammerat var nysgjerrig
på koden, men antageligvis ikke til noe hjelp.

Den består av to iframes, en som viser tbane-avganger fra Lambertseter,
hvor jeg bor. Den andre som viser været i Oslo, via https://api.openweathermap.org

## Ruter

Dette er bare mon.ruter.no som du enkelt kan sette opp sjæl.

## Været

Jeg snakker med openweathermap.org. Du må sette opp din egen API-nøkkel for å bruke
denne. Bytt ut "APPID" i filen weather.js med din egen APP-id for å teste ut. NB:
Det kan ta noe tid fra du har aktivert API-nøkkel til du kan bruke den, opp til
flere timer.

## Notater

Kona ville ha mulighet til å skrive notater også, så en knapp får opp en textarea
for notater. Det som skrives her lagres i localStorage, så du kan skru av KIOSK-appen
og så på igjen, og fremdeles se meldinger.

Personlig fant jeg en eller annen gratis KIOSK-app på Google Play som var gratis, og
som lot meg åpne web-sider som da er oppe helt til duppeditten går tom for strøm.
Duppeditten jeg bruker er en gammel Lenovo-tablet jeg fant på finn.no

## Lisens

Hvis du stjeler og bruker denne koden i produksjon må du oppsøke psykolog.
