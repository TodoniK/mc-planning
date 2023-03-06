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
      
      function generateICal(schedule) {
        let icalString = "BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\n";
        for (let date in schedule) {
          if (schedule.hasOwnProperty(date)) {
            let times = schedule[date];
            for (let i = 0; i < times.length; i++) {
              if (times[i] !== "&nbsp") {
                let startTime = times[i].split("-")[0];
                let endTime = times[i].split("-")[1];
                icalString += "BEGIN:VEVENT\\r\\n";
                icalString += "DTSTART:" + date + "T" + startTime + "\\r\\n";
                icalString += "DTEND:" + date + "T" + endTime + "\\r\\n";
                icalString += "END:VEVENT\\r\\n";
              }
            }
          }
        }
        icalString += "END:VCALENDAR\\r\\n";
        return icalString;
      }      

      var table = document.getElementsByTagName("table")[4];
      console.log(table);
      console.log(parseTableToSchedule(table));
      console.log(generateICal(parseTableToSchedule(table)));
      
      const icalData = generateICal(parseTableToSchedule(table));
      const icalBlob = new Blob([icalData], {type: 'text/calendar;charset=utf-8'});
      const icalUrl = URL.createObjectURL(icalBlob);
      
      const downloadLink = document.createElement("a");
      downloadLink.href = icalUrl;
      downloadLink.download = "emploi-du-temps.ics";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      `
    });
  });
});