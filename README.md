### Note
- quando cambi le funzioni dentro `server/src/db_interface.ts`, fai un `npm add @genezio-sdk/f123dashboard@1.0.0-prod` dentro la cartella del client. Se no le funzioni aggiunte non le riconosce.
- per azzerare il numero di partenza di un indice sequenziale nel db: 
	- `SELECT pg_get_serial_sequence('table_name', 'column_name');` per trovare il nome del campo sequenziale
	- `ALTER SEQUENCE public.fanta_player_new_id_seq RESTART WITH 1` per farlo ripartire da 1
	
### TODO
- selezione giocatori dinamica: giocatori selezionati già devono scomparire

- aggiungere punteggi bonus
- sistemare graficamente la pagina Chempionship da smartphone, è inguardabile
- sistemare graficamente la pagina chempionship standings per smartphone riducendo i caratteri 
- sistemare scritta immagine rolex da spartphone viene stirata
- cards piloti da ingrandire scritte delle caratteristiche e provarne a fare stare 2 affiancate da spartphone 
- rendere più grosse le celle di selezione del fanta nella visualizzazione smartphone (ridurre il carattere dei nomi) 

# INFO
mail:raceforfederica@gmail.com
password mail: RaceForFederica2024_

