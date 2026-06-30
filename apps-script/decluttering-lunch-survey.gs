/**
 * おしゃれ断捨離 ランチ会 アンケートフォームを作成する Google Apps Script。
 *
 * 使い方:
 *   1. https://script.google.com で新規プロジェクトを作成
 *   2. このファイルの内容を貼り付け
 *   3. createForm 関数を実行（初回は権限承認が必要）
 *   4. 実行ログに出力される「編集用URL」「回答用URL」を確認
 */
function createForm() {
  var form = FormApp.create('おしゃれ断捨離 ランチ会 アンケート 🌷');

  form.setDescription(
    '先日はおしゃれ断捨離ランチ会にご参加いただき、ありがとうございました🥂\n' +
    'よりよい会にしていくために、ぜひ感想を聞かせてください。\n' +
    '今後の企画のヒントにもさせていただきます✨（1〜2分で終わります）'
  );

  // Q1 お名前
  form.addTextItem()
    .setTitle('お名前')
    .setRequired(false);

  // Q2 満足度（1〜5）
  form.addScaleItem()
    .setTitle('今日のランチ会はいかがでしたか？')
    .setBounds(1, 5)
    .setLabels('物足りなかった', 'とても楽しかった')
    .setRequired(true);

  // Q3 楽しかったこと
  form.addParagraphTextItem()
    .setTitle('特に楽しかったこと・印象に残ったことを教えてください')
    .setRequired(true);

  // Q4 改善点
  form.addParagraphTextItem()
    .setTitle('「もっとこうだったら」という点があれば教えてください')
    .setRequired(false);

  // セクション区切り
  form.addPageBreakItem()
    .setTitle('今後の「おしゃれ断捨離」企画について 👗');

  // Q5 今後の企画（自由記述・例つき）
  form.addParagraphTextItem()
    .setTitle('今後やってみてほしい企画があれば、自由に教えてください')
    .setHelpText(
      '例えば…\n' +
      '・東京での開催\n' +
      '・買い物同行（一緒にお買い物）\n' +
      '・メイクレッスン\n' +
      '・おしゃれ断捨離パーティー\n' +
      'など、「こんなのあったら参加したい！」というものを気軽に書いてください😊'
    )
    .setRequired(false);

  // Q6 メッセージ
  form.addParagraphTextItem()
    .setTitle('最後に、一言メッセージがあればぜひ🌿')
    .setRequired(false);

  Logger.log('▼ 編集用URL: ' + form.getEditUrl());
  Logger.log('▼ 回答用URL: ' + form.getPublishedUrl());
}
