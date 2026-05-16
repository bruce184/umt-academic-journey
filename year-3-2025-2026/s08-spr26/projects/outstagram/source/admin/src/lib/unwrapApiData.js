export default function unwrapApiData(response) {
    return response?.data?.data ?? response?.data ?? response;
}
