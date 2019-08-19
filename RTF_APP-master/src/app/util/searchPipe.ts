import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'SearchFilter',
})
export class SearchFilter implements PipeTransform {
    transform(value: any, input: string) {
        if (input) {
            let inputLen = input.length;
            input = input.toLowerCase();
            return value.filter(function (el: any) {
                if (el.username) {
                    return el.username.substr(0, inputLen).toLowerCase().indexOf(input) > -1;
                }
            })
        }
        return value;
    }
}