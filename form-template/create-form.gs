function createBodyCheckForm() {

  // フォームを新規作成
  var form = FormApp.create('【お体チェック】体の写真送付フォーム');

  // 説明文
  form.setDescription(
    '西田美華オンラインサロン会員様限定のお体チェックフォームです✨\n' +
    'あなたの今の状態をしっかり確認して、もっとキレイになれるデザイン画像をお届けします！\n' +
    '送ってくれるだけでOK🙌 一緒に理想のカラダを目指しましょう💕\n\n' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    '⚠️ 写真の取り扱いについて（必ずご確認ください）\n' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    '・ご送付いただいた写真は、体のチェック結果をお届けするデザイン画像に使用します\n' +
    '・作成した画像はサロン内で公開される場合があります\n' +
    '・顔・個人情報が特定される情報は写らないようにご注意ください'
  );

  // ① お名前
  form.addTextItem()
    .setTitle('① お名前（サロン内のお名前でOK）')
    .setHelpText('ニックネームでも大丈夫です🌸')
    .setRequired(true);

  // ② 所属サロン
  form.addMultipleChoiceItem()
    .setTitle('② ご所属サロン')
    .setChoiceValues(['🌸 Bloom', '🌷 Bliss'])
    .setRequired(true);

  // ③ 同意確認
  form.addCheckboxItem()
    .setTitle('③ 写真の公開に関する同意')
    .setHelpText('※ご同意いただけない場合は、フォームをご利用いただけません')
    .setChoiceValues(['📌 写真がサロン内で公開されることに同意します'])
    .setRequired(true);

  // ④ 写真アップロード
  form.addFileUploadItem()
    .setTitle('④ 体の写真をアップロードしてください📸')
    .setHelpText('顔が写らないようにご注意ください｜JPG / PNG｜最大10MB\n✨ 正面・横・後ろの3枚があると◎')
    .setAllowedFileTypes([FormApp.FileType.IMAGE])
    .setMaxFileSize(10)
    .setRequired(true);

  // ⑤ 気になる部位
  form.addParagraphTextItem()
    .setTitle('⑤ 気になっている部位・お悩みを教えてください')
    .setHelpText('例）お腹まわり・二の腕・脚のむくみ、など自由に書いてね')
    .setRequired(true);

  // ⑥ 一言メッセージ
  form.addParagraphTextItem()
    .setTitle('⑥ 美華さんへ一言メッセージ💌')
    .setHelpText('なんでも気軽に書いてね🩷（任意）')
    .setRequired(false);

  // 完了メッセージ
  form.setConfirmationMessage(
    '送ってくれてありがとう💕\n' +
    '美華がしっかりチェックしてお届けします！\n' +
    'しばらくお待ちください🌸'
  );

  // 作成されたフォームのURLをログに表示
  Logger.log('✅ フォームが作成されました！');
  Logger.log('編集URL: ' + form.getEditUrl());
  Logger.log('回答URL: ' + form.getPublishedUrl());
}
