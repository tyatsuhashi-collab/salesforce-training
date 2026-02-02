export const metadata = {
  title: 'Salesforce 構築検定',
  description: '新入社員向けトレーニングアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, backgroundColor: "#f0f2f5" }}>
        {children}
      </body>
    </html>
  )
}
