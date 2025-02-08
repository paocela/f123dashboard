<p align="center">
  <img src="client/src/assets/images/logo_raceforfederica.png" width="200">
  <img src="client/src/assets/images/f1_evolution.gif" width="700">
  <img src="client/src/assets/images/logo_raceforfederica.png" width="200">
</p>

# F1 Dashboard RaceForFederica 

Dashboard for the Esport F1 23 championship (friendly, but not so much...)

**Table of Contents:**

* [Preview](#preview)
* [Building and Installing](#building-and-installing)
* [Notes](#notes)
* [Todo](#todo)
* [Credits](#credits)

## Preview 🧐

## Building and Installing 🛠️

## Notes 📋

- quando cambi le funzioni dentro `server/src/db_interface.ts`, fai un `npm add @genezio-sdk/f123dashboard@1.0.0-prod` dentro la cartella del client. Se no le funzioni aggiunte non le riconosce.
- per azzerare il numero di partenza di un indice sequenziale nel db: 
	- `SELECT pg_get_serial_sequence('table_name', 'column_name');` per trovare il nome del campo sequenziale
	- `ALTER SEQUENCE public.fanta_player_new_id_seq RESTART WITH 1` per farlo ripartire da 1
- per lanciare in locale, ricordati di settare la variabile d'ambiente `RACEFORFEDERICA_DB_DATABASE_URL` alla stringa di connessione al db postgre
	

## Todo 🎯

- Costruttore deve essere assegnato automaticamente in base alla classifica
- voto pole position x fanta
- offri un caffè agli sviluppatori
sviluppatori
- link a pagina instagram

## Credits 🙇
Credits for this small but fun project goes to:
- [Paolo Celada](https://github.com/paocela)
- [Federico Degioanni](https://github.com/FAST-man-33)
- [Andrea Dominici](https://github.com/DomiJAR) 