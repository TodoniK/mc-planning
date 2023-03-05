document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("btnConvert").addEventListener("click", function() {

    chrome.tabs.executeScript({
      code: `

      function convertDate(dateStr) {

        // On découpe la chaîne en utilisant l'espace et le slash comme délimiteurs
        const parts = dateStr.split(' ');
        const day = parts[1].split('/')[0];
        const month = parts[1].split('/')[1];
        const year = new Date().getFullYear(); // On récupère l'année courante
        const date = new Date(year, month - 1, day); // On crée un objet Date avec la date courante

        // On formate la date au format jj/mm/aaaa
        const formattedDate = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
        
        return formattedDate;
      }
      
      function parseTableToSchedule(table) {
        const rows = table.rows;
        const schedule = {};
      
        // Récupération des dates
        const datesRow = rows[1];
        for (let i = 0; i < datesRow.cells.length; i++) {
          const cell = datesRow.cells[i];
          const date = convertDate(cell.textContent.trim());
          schedule[date] = ['', ''];
        }
      
        // Récupération des horaires
        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          const cells = row.cells;
          for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            const time = cell.textContent.trim();
            if (time !== '\u00A0') { // Vérification que la case n'est pas vide
              const date = convertDate(datesRow.cells[j].textContent.trim());
              if (i === 2) {
                schedule[date][0] = time;
              } else {
                schedule[date][1] = time;
              }
            }
          }
        }
      
        return schedule;
      }
      
      function createICalFile(schedule) {
        let iCalContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//My calendar//EN\r\n';
        
        for (let date in schedule) {
          let start = schedule[date][0];
          let end = schedule[date][1];
          
          let formattedDate = date.replace(/(\d{2})\/(\d{2})/, "20$2$1T");
          
          iCalContent += 'BEGIN:VEVENT\r\n';
          iCalContent += "DTSTART:" + formattedDate + start + '00\r\n';
          iCalContent += "DTEND:" + formattedDate + end + '00\r\n';
          iCalContent += 'END:VEVENT\r\n';
        }
        
        iCalContent += "END:VCALENDAR";
        
        return iCalContent;
      }      

      var table = document.getElementsByTagName("table")[4];
      console.log(table);
      console.log(parseTableToSchedule(table));

      `
    });
  });
});