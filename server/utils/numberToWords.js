// Helper function to convert number to Vietnamese words
export const numberToVietnameseWords = (num) => {
    if (num === 0) return "không đồng";

    const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    const scales = ["", "nghìn", "triệu", "tỷ"];

    const readGroup = (n) => {
        let result = "";
        const hundred = Math.floor(n / 100);
        const ten = Math.floor((n % 100) / 10);
        const one = n % 10;

        if (hundred > 0) {
            result += ones[hundred] + " trăm";
            if (ten === 0 && one > 0) result += " lẻ";
        }

        if (ten > 1) {
            result += (result ? " " : "") + tens[ten];
            if (one === 1) result += " mốt";
            else if (one === 5) result += " lăm";
            else if (one > 0) result += " " + ones[one];
        } else if (ten === 1) {
            result += (result ? " " : "") + "mười";
            if (one === 5) result += " lăm";
            else if (one > 0) result += " " + ones[one];
        } else if (one > 0) {
            result += (result ? " " : "") + ones[one];
        }

        return result;
    };

    let result = "";
    let scaleIndex = 0;

    while (num > 0) {
        const group = num % 1000;
        if (group > 0) {
            const groupText = readGroup(group);
            result = groupText + (scales[scaleIndex] ? " " + scales[scaleIndex] : "") + (result ? " " : "") + result;
        }
        num = Math.floor(num / 1000);
        scaleIndex++;
    }

    return result.trim() + " đồng";
};
