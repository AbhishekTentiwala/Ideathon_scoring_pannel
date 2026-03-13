import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export const exportResultsPDF = (data) => {
  const { rows, judges, maxScore, criteria } = data;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const ORANGE = [249, 115, 22];
  const NAVY = [14, 27, 77];
  const LIGHT = [248, 250, 253];
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 297, 210, "F");

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, 8, 210, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text("STARTUP KHUMB", 148, 75, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...ORANGE);
  doc.text("Ideathon Evaluation Results", 148, 90, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(180, 190, 210);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 148, 105, { align: "center" });
  doc.text(`${rows.length} Startups · ${judges.length} Judges · Max Score: ${maxScore}`, 148, 113, { align: "center" });

  // Criteria legend
  doc.setFontSize(9);
  doc.setTextColor(140, 150, 170);
  let cy = 135;
  criteria.forEach(c => {
    doc.text(`${c.key}: ${c.label} (Weightage ×${c.weightage}, Max ${c.maxScore})`, 40, cy);
    cy += 8;
  });


  doc.addPage();

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, 297, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("LEADERBOARD", 148, 9.5, { align: "center" });

  const lbRows = rows.map((r, i) => [
    i + 1,
    r.startup.teamName,
    r.startup.projectTitle || "Project title not added yet",
    r.startup.category || "—",
    r.averageScore.toFixed(2),
    `${Math.round((r.averageScore / maxScore) * 100)}%`,
    r.evaluated,
  ]);

  autoTable(doc, {
    startY: 18,
    head: [["#", "Team", "Project", "Category", "Avg Score", "% Score", "Judges"]],
    body: lbRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      4: { halign: "center", fontStyle: "bold" },
      5: { halign: "center" },
      6: { halign: "center" },
    },
    didDrawRow: (data) => {
      if (data.row.index === 0) {
        doc.setFillColor(255, 215, 0);
      }
    },
  });

  rows.forEach((row, idx) => {
    doc.addPage();

    // Header
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, 297, 14, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(
      `#${idx + 1} · ${row.startup.teamName} — ${row.startup.projectTitle || "Project title not added yet"}`,
      148,
      9.5,
      { align: "center" }
    );

    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "normal");
    doc.text(`Category: ${row.startup.category || "—"}  ·  Average Score: ${row.averageScore.toFixed(2)} / ${maxScore}  ·  Evaluations: ${row.evaluated} / ${judges.length}`, 10, 22);

    const head = ["Criterion", "Weightage", "Max", ...judges.map(j => j.name), "Avg Stars", "Avg Weighted"];
    const body = criteria.map(c => {
      const judgeVals = judges.map(j => {
        const s = row.judgeScores[j._id.toString()];
        if (!s) return "—";
        const bd = s.breakdown?.find(b => b.key === c.key);
        return bd ? `${bd.stars}★` : "—";
      });
      const judgeWeighted = judges.map(j => {
        const s = row.judgeScores[j._id.toString()];
        if (!s) return "—";
        const bd = s.breakdown?.find(b => b.key === c.key);
        return bd ? bd.score : "—";
      });
      const avgStars = judgeVals
        .filter(v => v !== "—")
        .reduce((s, v) => s + parseInt(v), 0) / (judgeVals.filter(v => v !== "—").length || 1);
      const avgW = judgeWeighted
        .filter(v => v !== "—")
        .reduce((s, v) => s + v, 0) / (judgeWeighted.filter(v => v !== "—").length || 1);

      return [c.label, `×${c.weightage}`, c.maxScore, ...judgeVals, avgStars.toFixed(1), avgW.toFixed(1)];
    });

    autoTable(doc, {
      startY: 28,
      head: [head],
      body,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
    });

    //
    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ORANGE);
    doc.text(`TOTAL: ${row.averageScore.toFixed(2)} / ${maxScore}  (${Math.round((row.averageScore / maxScore) * 100)}%)`, 10, finalY);
  });

  doc.save(`startup-khumb-results-${Date.now()}.pdf`);
};
