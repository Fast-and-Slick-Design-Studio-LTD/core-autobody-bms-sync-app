export enum IPC_KEY {
    OPEN_FOLDER = "open_folder",
    OPEN_FOLDER_SUCCESS = "open_folder_succeed",
    OPEN_FOLDER_CANCEL = "open_folder_cancelled",
    LOGOUT = "logout",
    GET_FILE_HISTORY = "get_file_history",
    GET_BMS_FOLDER = "get_bms_folder",
    CHECK_BMS_FOLDER = "check_bms_folder",
    LOGIN_REQUEST = "login_request",
    VERIFY_TOKEN_REQUEST = "verify_token_request"
}

export enum CHANNEL {
    FILE_HISTORY_REPLY = "file_history_reply",
    FILE_NEW_HISTORY_REPLY = "file_new_history_reply",
    BMS_FOLDER_REPLY = "bms_folder_reply",
    LOGIN_REPLY = "login_reply",
    LOGOUT_REPLY = "logout_reply",
    VERIFY_TOKEN_REPLY = "verify_token_reply"
}