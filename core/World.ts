export default class World{
    public objects:any[]=[]

    public print(){
        for (const obj of this.objects) {
            alert(obj)
        }
    }
}