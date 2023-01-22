export interface ValidationError {
    value: String;
    msg: String;
    param: String;
    location: String;
}
export interface ValidationResult {
    errors?: Object[];
    formatter?: Function;
}
