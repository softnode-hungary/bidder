import newPage from "../newPage";

export default (doc, text, startY, fontSize, lineSpacing, isBold = false, startx = 57, nextTextIsOneLine = false) => {

    let startX = startx;
    doc.setFontSize(fontSize);
    const pageWidth = doc.internal.pageSize.width;
    if(!isBold)
    {
        doc.setFontType('normal');
        startY += lineSpacing;
    }
    else
    {
        doc.setFontType('bold');
        startY += lineSpacing * 4;
    }
    let splitText = doc.splitTextToSize(
        text,
        pageWidth-(startX*2)
    );

    // <><>><><>><>><><><><><>>><><<><><><><>
    // new page check before text output
    const pageHeight = doc.internal.pageSize.height;
    
    const endY = pageHeight - 120; // minus footerHeight
    const neededSpacing = lineSpacing * 4;
    let neededHeight = splitText.length * doc.internal.getLineHeight();
    let spaceForLines = Math.floor((endY - startY) / doc.internal.getLineHeight());

    // check if new page is needed right at beginning

    if(nextTextIsOneLine == false) startY = newPage(doc, startY, neededSpacing);


    // <><>><><>><>><><><><><>>><><<><><><><>
    // power algorithm to split long text on multiple pages
    let textStart;

    while (endY - startY - neededHeight < 0 && splitText.length > spaceForLines) {
        spaceForLines = Math.floor((endY - startY) / doc.internal.getLineHeight());
        neededHeight = splitText.length * doc.internal.getLineHeight();

        textStart = splitText.slice(0,spaceForLines);
        doc.setFont('WorkSans'); // set font here again, else weirdo things are printed out
        doc.text(textStart, startX, startY);

        splitText = splitText.slice(spaceForLines);

        if(nextTextIsOneLine == false) startY = newPage(doc, startY, neededHeight);
    }

    // set font here again, else weirdo things are printed out
    doc.setFont('WorkSans');
    doc.text(splitText, startX, startY);
    neededHeight = splitText.length * doc.internal.getLineHeight();
    if(nextTextIsOneLine == false) startY += neededHeight + lineSpacing;

    return startY;
}
