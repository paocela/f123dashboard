# F1 Dashboard RaceForFederica 
Dashboard per il campionato Esport di F1 23

### Note
- quando cambi le funzioni dentro `server/src/db_interface.ts`, fai un `npm add @genezio-sdk/f123dashboard@1.0.0-prod` dentro la cartella del client. Se no le funzioni aggiunte non le riconosce.
- per azzerare il numero di partenza di un indice sequenziale nel db: 
	- `SELECT pg_get_serial_sequence('table_name', 'column_name');` per trovare il nome del campo sequenziale
	- `ALTER SEQUENCE public.fanta_player_new_id_seq RESTART WITH 1` per farlo ripartire da 1
	
### Todo
- Incrementare valore massimo grafico andamento
- Costruttore deve essere assegnato automaticamente in base alla classifica
- git crypt chiavi db
- voto pole position x fanta
- offri un caffè agli sviluppatori
sviluppatori
- link a pagina instagram
