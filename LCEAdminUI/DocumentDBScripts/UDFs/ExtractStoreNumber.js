function ExtractStoreNumber(data) {
    if (!!data) {
        if (isNaN(data)) {
            data = data
        }

        else {
            data = data.toString()

        }
    } else {
        data = "";
    }

    return data;
}