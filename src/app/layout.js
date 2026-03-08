import "./globals.css";

export const metadata = {
  title: "ExamPrep AI – Turn Study Material into Exam Kits",
  description:
    "Upload your notes, textbook, or PDF and instantly get summaries, flashcards, quizzes, and more powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
