function ExtractPhoneNumber(PhoneNumber) {
    if (!!PhoneNumber) {
        PhoneNumber = PhoneNumber.match(/\d/g).join("");
    }
    else {
        PhoneNumber = 1586224580;

    }

    return PhoneNumber;
}